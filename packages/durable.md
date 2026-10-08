# `@anvia/durable`

`@anvia/durable` runs Anvia agents with persisted model and tool checkpoints. Submit work, observe its
progress, and recover unfinished runs after a process restart. It adds a durable lifecycle around existing
agents: direct `agent.generate()` and `agent.stream()` remain available, and durable execution uses
`runtime.submit()` and a `DurableRun` handle instead.

::: warning Experimental
The package is experimental and its database records may change. It targets **one runtime owner per local
SQLite database**, on one host, supervised by your own process manager. It is not a distributed worker
service and is not presented as production-ready. See [Capabilities](/packages/durable/capabilities) for the
exact scope.
:::

## Install

```sh
pnpm add @anvia/durable @anvia/core zod
```

Add a provider package such as `@anvia/openai` for the model. SQLite storage uses Node's built-in
`node:sqlite`, so the package requires **Node.js 22.16 or newer**. Use the accompanying `@anvia/core`
release: the durable package requires core's agent execution protocol version 2 and rejects older core
versions when it is imported. `zod` is a peer dependency.

To expose durable runs over HTTP, add `@anvia/server` (`@anvia/server/durable`) and `@anvia/client`
(`@anvia/client/durable`). Both declare an optional peer range for `@anvia/durable` 0.1, 0.2, and 0.3.

## What it provides

```text
submit → queued request + event (atomic) → model/tool checkpoints → outcome
                  ↑ restart: reconstruct the loop from committed results ↓
```

| Capability | Summary |
| --- | --- |
| SQLite storage | WAL, full synchronous commits, atomic run state, operation results, and events. |
| Deduplicated submissions | One run per `(sessionId, requestId)`; changed content under the same ID conflicts. |
| Checkpoints | Normalized model responses and tool results are committed and reused on recovery. |
| Restart recovery | `runtime.resume()` reschedules unfinished work; completed operations are never repeated. |
| Approvals and questions | Core interactions persist across restarts and accept one response per interaction ID. |
| Progress events | Committed, ordered events with cursors for reconnectable observation. |
| Agent streaming | Opt-in persisted model deltas, grouped by unique attempt IDs. |
| Multimodal prompts | Strings or core `UserMessage` values with image and file parts. |
| Queues and retry | Opt-in session queues, bounded concurrency, and persisted model backoff. |
| Runtime registration | Add agents without a restart; remove idle registrations safely. |
| Custom tasks | Versioned, schema-validated tasks with checkpoints, owned children, timers, signals, and effects. |
| Static task graphs | Persisted DAGs of registered-agent tasks with committed dependency outputs. |
| Operations | Fail-closed storage, readiness, metrics, limits, and offline backup and restore. |

## Entry points

| Import | Purpose |
| --- | --- |
| `@anvia/durable` | `DurableRuntime`, `defineTask`, run/task/graph handles, errors, and types. |
| `@anvia/durable/sqlite` | `SqliteDurableStore`. Kept separate so the root never imports `node:sqlite`. |
| `@anvia/durable/protocol` | Browser-safe validators and types used by the HTTP client. |
| `@anvia/durable/maintenance` | Offline `backupSqlite` and `restoreSqlite`. |

## Continue

- [Get started](/packages/durable/get-started)
- [Capabilities](/packages/durable/capabilities)
- [Configuration](/packages/durable/configuration)
- [Tasks and graphs](/packages/durable/tasks-and-graphs)
- [HTTP server and client](/packages/durable/http)
- [Operations](/packages/durable/operations)
- [API reference](/packages/durable/api-reference)
- [Releases](/packages/durable/releases)
- [Durable execution guide](/sdk/advanced/durable-execution)
