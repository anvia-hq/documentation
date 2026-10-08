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
| `maxPayloadBytes` | 1,048,576 | UTF-8 JSON size of a run's prompt, input, history, responses, and outcome; a task's input, checkpoint, signals, and successful output; an operation's input and result; and each streamed delta. |
| `maxOperations` | 10,000 | Operations per execution. |

Limits must be positive safe integers. Capacity checks and insertion share one transaction, so a graph or
owned-agent creation that exceeds capacity rolls back atomically, and repeating an identical existing
submission still succeeds at capacity. Terminal executions release capacity. Admission failures throw
`DurableLimitError` (HTTP 429). Status and control changes remain possible after limits are lowered on
restart, failure diagnostics use a separate 4,096-character bound, and copying an already-admitted owned
agent output survives lower quotas.

An oversized external effect result leaves its started intent and blocks for reconciliation instead of
running the effect again. An oversized checkpoint blocks the task for attention: raise the limit and retry,
or cancel. Limits do not expire data, and automatic retention and execution deadlines are not available. Do
not delete journal rows manually; deduplication, history, cursors, and recovery depend on them. HTTP bodies
have their own `maxBodyBytes`.

## Backup and restore

```ts
import { backupSqlite, restoreSqlite } from '@anvia/durable/maintenance'

await runtime.close()
const info = await backupSqlite('./durable.sqlite', './backup-2026-10-06.sqlite')
// Later, while the original deployment remains stopped:
await restoreSqlite('./backup-2026-10-06.sqlite', './restored.sqlite')
```

Both functions return a `DurableBackupInfo` of `{ createdAt, schemaVersion }` and are offline maintenance
operations that accept schema 3 or 4 databases. `backupSqlite` acquires the database's exclusive ownership,
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

Opening a database upgrades schemas 1 to 3 to schema 4 on ownership acquisition, retaining existing runs,
graphs, and tasks. The maintenance helpers cover schemas 3 and 4 only, so take an infrastructure-level
offline snapshot before upgrading an older schema. Older engines reject schema 4, and there is no automatic
downgrade; roll back by restoring the prior backup to a new file and auditing post-backup external effects.

Tests cover injected journal failures, process kills at real model and tool boundaries, bounded task load,
cancellation, remote authorization, and backup and restore. They do not replace a disk-full or read-only
drill, a long soak on your filesystem, or an operational recovery exercise.
