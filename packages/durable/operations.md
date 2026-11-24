# Operations

`@anvia/durable` remains experimental. It targets one supervised Node.js process (22.16 or newer), one host,
and a dedicated SQLite database on local storage. Do not run multiple owners, share the file over a network
filesystem, or run a restored copy alongside the original deployment.

## Failure handling and health

```ts
const runtime = await DurableRuntime.open({
  store,
  tasks,
  agents,
  onFatalError(error) {
    supervisor.report(error)
  },
  limits: {
    maxPendingRuns: 10_000,
    maxPendingTasks: 10_000,
    maxPayloadBytes: 1_048_576,
    maxOperations: 10_000,
  },
})
await runtime.resume()
```

The runtime **fails closed**. A storage read, write, admission, or commit error stops both schedulers, aborts
active callbacks, and rejects further work with the original error. It is never converted into an ordinary
failed business outcome, and a callback cannot catch a journal failure and keep committing. Close the
runtime, repair the storage problem, then open and resume it. If ownership cleanup also fails during close,
restart the owning process through its supervisor; do not forcibly clear a live owner row. Recovery policies
still apply: models can repeat after an interrupted checkpoint, and uncertain manual tools and effects need
reconciliation.

`onFatalError` fires once per failed owner. Errors thrown or rejected by the observer are ignored, and the
observer receives the error or its cause, so apply your own logging and redaction.

`runtime.health()` performs no database access and returns `status` (`ready`, `failed`, `closing`, or
`closed`), `ready`, `activeRuns`, and `activeTasks`. Readiness means the owner accepts work; it does not
prove providers are reachable or that definitions match saved work.

`runtime.metrics()` returns a `DurableMetrics` aggregate: `observedAt`, per-status `runs` and `tasks`
counts, `oldestPendingAgeMs`, `operations`, `events`, and `databaseBytes` (allocated SQLite page bytes,
excluding WAL and SHM files). It contains no session IDs, prompts, or outputs. It scans aggregate tables, so
scrape periodically (for example every 30 seconds) rather than per request.

Alert on readiness loss, growing queue age, `needs_attention`, `retry_wait`, `cancelling`, disk pressure, and
backup age. Waiting for an approval or signal is not itself an error. Cancellation and shutdown are
cooperative: callbacks must honor their `AbortSignal`, and your supervisor should enforce a shutdown grace
period.

## Admission and payload limits

| Limit | Default | Bounds |
| --- | --- | --- |
| `maxPendingRuns` | 10,000 | Unfinished runs, including graph nodes and owned agents. |
| `maxPendingTasks` | 10,000 | Unfinished custom tasks, including owned children. |
| `maxPayloadBytes` | 1,048,576 | UTF-8 JSON size of each persisted value: a run's prompt, trace, input, history, responses, steering, outcome, context checkpoint, and exhaustion; a task's trace, input, checkpoint, signals, and successful output; an operation's input and result; and each `model_delta` event. |
| `maxOperations` | 10,000 | Operations per execution. |
| `maxBodyBytes` | 65,536 | HTTP request body bytes, measured as received. This is a handler option, not a runtime limit. |

Limits must be positive safe integers. `maxPayloadBytes` is a per-field cap on a single write, not a session
budget. The same content is counted again wherever it is persisted: a prompt lives in `run.prompt`, again in
`run.input`, again in the model operation request with the provider and model envelope, and later in
`history` and `outcome`. Budget for "prompt + history + request envelope ≤ `maxPayloadBytes`"; `run.input`
is usually the field that crosses first, and the error names it.

The HTTP body limit is the binding ceiling for uploads. Base64 images and long documents must fit
`maxBodyBytes` before the runtime sees them. The default 64 KiB body limit is far below the default payload
limit, so a large image is rejected with HTTP 413 before payload admission is consulted. Raise
`maxBodyBytes` to at least the largest encoded request you accept; the payload limit still applies
afterwards.

Capacity checks and insertion share one transaction, so a graph or owned-agent creation that exceeds
capacity rolls back atomically, and repeating an identical existing submission still succeeds at capacity.
Terminal executions release capacity. Status and control changes remain possible after limits are lowered
on restart, failure diagnostics use a separate 4,096-character bound, and copying an already-admitted owned
agent output survives lower quotas.

Admission rejects with `DurableLimitError`, which has `code` (`'payload_too_large'` or
`'capacity_exceeded'`) plus optional `field`, `limit`, and `actual` values. Payload messages name the field
and byte counts. `payload_too_large` can never succeed for the same request; `capacity_exceeded` clears as
unfinished work settles. Over HTTP, payload limits return 413 and capacity returns 429, both with
`{ error, code, field? }`; a body over `maxBodyBytes` also returns 413 and includes its `limit`.
`DurableHttpError` in `@anvia/client` exposes `status`, `code`, `field`, and the server message.

A run that cannot start because its prompt, input, or inherited history exceeds the payload limit ends in
terminal `failed`, not `needs_attention`: no work is pending, so there is nothing for an operator to
unblock. `run.result()` rejects with `DurableRunError` (`status: 'failed'`) and the event stream ends.
Retrying recomputes the inherited history from the session's latest settled run and persists it before
execution. If it still does not fit, `retry()` rejects with the same `DurableLimitError` and the run stays
failed; a retry never runs with a shorter history. Raise `maxPayloadBytes`, restart, and retry to continue
the session.

An oversized external effect result leaves its started intent and blocks for reconciliation instead of
running the effect again. An oversized custom-task checkpoint or transition blocks the task for operator
attention: raise the limit and retry, or cancel. Limits do not expire data, and automatic retention and
execution deadlines are not available. Do not delete journal rows manually; deduplication, history,
cursors, and recovery depend on them.

## Backup and restore

```ts
import { backupSqlite, restoreSqlite } from '@anvia/durable/maintenance'

await runtime.close()
const info = await backupSqlite('./durable.sqlite', './backup-2026-10-06.sqlite')
// Later, while the original deployment remains stopped:
await restoreSqlite('./backup-2026-10-06.sqlite', './restored.sqlite')
```

Both functions return a `DurableBackupInfo` of `{ createdAt, schemaVersion }` and are offline maintenance
operations that accept schema 3 through 9 databases. `backupSqlite` acquires the database's exclusive ownership,
uses SQLite's backup API (including committed WAL state), integrity-checks the copy, seals it with metadata,
and publishes a new file with mode 0600. Existing destination files, symlinks, and SQLite sidecars are
rejected and nothing is replaced. A sealed archive cannot be opened as a runtime. `restoreSqlite` validates
the archive and creates a new unsealed database without modifying the archive or a live file. If directory
sync fails after publication the call reports an error but the destination may exist, so inspect it.

Archives contain prompts, checkpoints, signals, and tool results: protect and encrypt them. Stop the original
deployment before restoring, restore compatible code and task definitions, and inspect unfinished snapshots
before `resume()`. Resetting ownership does not fence an original runtime at another path or host. External
effects performed after the backup are not in the snapshot, so reconcile them using stable idempotency keys
before replay. Restoring cannot undo payments, emails, or other external work. Practice restoration in an
isolated environment with side effects disabled, and measure recovery point and time.

## Upgrade, rollback, and rollout

1. Drain traffic, stop admission, close the runtime, and take a verified backup.
2. Keep the previous application artifact and matching task and agent definitions.
3. Test the new application on a restored copy with external services isolated.
4. Restart one owner, inspect readiness and blocked work, call `resume()`, then admit a small workload.
5. Expand only after fault recovery, restoration, and sustained-load checks meet your targets.

Opening a database upgrades schemas 1–8 to schema 9 on ownership acquisition, retaining existing runs,
graphs, and tasks. The maintenance helpers accept schemas 3–9; backup acquisition upgrades its source
before producing a schema-9 archive. Keep an infrastructure-level offline copy before an upgrade when
rollback to an older engine is required. Older engines reject schema 9, and there is no automatic
downgrade; roll back by restoring the prior backup to a new file and auditing post-backup external effects.

Tests cover injected journal failures, process kills at real model and tool boundaries, bounded task load,
cancellation, remote authorization, and backup and restore. They do not replace a disk-full or read-only
drill, a long soak on your filesystem, or an operational recovery exercise.

## Bounded inspection and shared histories

For frequent polling, use `await run.status()` or `runtime.status(runId)`: these read a bounded
`DurableRunSummary` without decoding transcripts. `runtime.run(runId)` reads the record without
operations. `run.snapshot({ operations: false })` still decodes the record and outcome but skips
operation payloads. Task snapshots omit operations by default; request `{ operations: true }`
when inspecting effects.

Since 0.7, SQLite snapshots expose compact operation envelopes. Model operations with
`historyEncoding: 'linked-v1'` store an opaque `{ head, length }` at `input.request.chatHistory`;
context operations also use linked histories. Use `runtime.operationRequest(runId, operation.key)`
to reconstruct a model's full `CompletionRequest`, including pre-compaction requests. Do not treat
stored history references as message arrays. Backups include the shared log; there is no automatic
pruning or vacuum.

Custom stores must implement bounded `DurableTransaction.getRunSummary(id)` reads, return expanded
histories from `getOperation()`, and preserve stored envelopes in `operations()`. Upgrade Core and
Durable together for execution protocol 4. New runs capture steering and live-compaction support;
legacy runs preserve their original replay boundaries. Test recovery on a database copy before rollout.
