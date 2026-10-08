# Production and operations

`@anvia/durable` is experimental. Treat this page as the minimum for a trial deployment, not a
production-readiness certification.

## 1. Host the runtime

- Keep one application-scoped `DurableRuntime` per database. A second live owner is rejected.
- Use a dedicated SQLite file on a **local filesystem**, with WAL and full synchronous commits. Do not share
  it over a network filesystem. `:memory:` does not survive restart.
- Run under a process supervisor on a persistent volume. Durability does not wake a stopped machine, and
  timers do not keep Node alive by themselves.
- On startup call `runtime.resume()`. On shutdown stop admitting work and await `runtime.close()`. Models and
  tools must honor their `AbortSignal` for a prompt shutdown.
- Keep the database private: it holds prompts, normalized responses, tool arguments and results, and
  interaction state. Retention, encryption, authentication, and authorization are yours.

## 2. Fail closed on storage errors

A storage read, write, or commit failure stops both schedulers, aborts active callbacks, and rejects new work.
It is never recorded as an ordinary failure. Close the runtime, repair storage, and reopen. Report the failure
to your supervisor once:

```ts
const runtime = await DurableRuntime.open({
  store,
  agents,
  onFatalError: (error) => supervisor.report(error),
})
```

`runtime.health()` reports `ready`, `failed`, `closing`, or `closed` without touching the database, plus
`activeRuns` and `activeTasks`. `runtime.metrics()` returns aggregate status counts, the oldest unfinished
work age, operation and event totals, and allocated database bytes, with no prompts or session IDs. Scrape it
periodically and expose it behind your own authentication. Also monitor free disk space and WAL size, and
alert on readiness loss, queue age, `needs_attention`, `retry_wait`, and `cancelling`.

## 3. Bound admission

```ts
limits: { maxPendingRuns: 10_000, maxPendingTasks: 10_000, maxPayloadBytes: 1_048_576, maxOperations: 10_000 }
```

Exceeding a limit throws `DurableLimitError` (HTTP 429), and capacity checks are atomic with the insert.
Payload limits cover prompts, history, responses, outcomes, checkpoints, signals, operation results, and each
streamed delta. They do not stop your code allocating large values first, and nothing expires old data
automatically. Do not delete journal rows by hand.

## 4. Expose runs over HTTP carefully

`createDurableHandler` from `@anvia/server/durable` requires an `authorize` callback for every operation,
including reads and event streams. Authorization resources identify the session, run, agent, graph, and task.
Existing runs authorize from the stored session, owned agents map to their parent task's session, and
clients can only choose registered task names, so allowlist definitions and agents. See
[HTTP server and client](/packages/durable/http) for routes and `DurableClient` reconnection.

## 5. Back up and roll out

```ts
import { backupSqlite, restoreSqlite } from '@anvia/durable/maintenance'

await runtime.close()
await backupSqlite('./durable.sqlite', './backup.sqlite')
await restoreSqlite('./backup.sqlite', './restored.sqlite') // always a new file
```

Backup and restore are offline, accept schema 3 or 4, and only write new files. Never run a restored copy next
to the original, and reconcile external effects that happened after the backup before replaying. SQLite
upgrades older schemas to 4 on acquisition, older engines reject schema 4, and there is no downgrade: roll
back from a backup. Drain, back up, test against a restored copy, then restart one owner and admit a small
workload. See [Operations](/packages/durable/operations) for the full procedure.

## 6. Checklist

- One owner, local disk, supervised process, `resume()` at startup, `close()` at shutdown.
- Every tool and effect classified `manual`, `safe`, or `idempotent`, with real deduplication where claimed.
- Approval, `needs_attention`, and reconciliation paths built and authorized.
- Agent versions bumped on incompatible changes, and old versions restorable.
- Limits sized for your payloads, including base64 media and streamed deltas.
- Health, metrics, disk, and backup-age alerts, and a rehearsed restore.
