# `@anvia/durable`

`@anvia/durable` runs Anvia agents with persisted model and tool checkpoints. Submit work, observe its
progress, and recover unfinished runs after a process restart. It adds a durable lifecycle around existing
agents: direct `agent.generate()` and `agent.stream()` remain available, and durable execution uses
`runtime.submit()` and a `DurableRun` handle instead.

::: warning Experimental
The package is experimental and its database records may change. A SQLite database has **one owner** on one
host. Postgres, Drizzle, and Prisma databases support one owning runtime **or** several shared workers, never
both at once. Durable is not presented as production-ready. See [Capabilities](/packages/durable/capabilities)
for the exact scope.
:::

## Install

```sh
pnpm add @anvia/durable @anvia/core zod
```

Add a provider package such as `@anvia/openai` for the model. SQLite storage uses Node's built-in
`node:sqlite`, so that backend requires **Node.js 22.16 or newer**. Durable requires core's agent execution
protocol version **5** and declares `@anvia/core` `>=1.19.1 <2`; older core versions are rejected when a
runtime opens.

To expose durable runs over HTTP, add `@anvia/server` (`@anvia/server/durable`) and `@anvia/client`
(`@anvia/client/durable`). Reviewed Client 1.9.0 and Server 1.5.0 accept Durable `>=0.8.0 <1.0.0`. Steering
requires Durable 0.8+, HTTP task agent binding requires 0.6+, and tracing requires 0.11+ (0.12+ for an
observability session override). Remote memory-write reconciliation and shared workers require 0.18+.

## Storage and deployment roles

| Store | Import | Ownership |
| --- | --- | --- |
| SQLite file | `@anvia/durable/sqlite` | One owning runtime. `readOnly: true` for observation only. |
| Postgres | `@anvia/durable/postgres` | One owning runtime, or shared workers with per-run claims. |
| Drizzle | `@anvia/durable/drizzle` | Same as Postgres; the schema is yours. |
| Prisma | `@anvia/durable/prisma` | Same as Postgres; the models are yours. |
| Custom | your module | Implement the async `DurableStore` contract. |

Postgres accepts a `pg` pool or connection string; run with `schema: 'create'` once to create tables, or keep
the default verification mode. Drizzle and Prisma use schemas you generate with `anvia-durable-drizzle` or
`anvia-durable-prisma`, then verify them. `pg`, `drizzle-orm`, and `@prisma/client` are optional peers.

A deployment separates four roles that can run in different processes:

| Role | API | Lease | Executes |
| --- | --- | --- | --- |
| Owning runtime | `DurableRuntime.open()` | Exclusive owner | Its own queued work. |
| Shared worker | `DurableRuntime.open({ worker })` or `DurableWorker.start()` | Per-run claims | Runs, graphs, tasks, and goals. |
| Store-only client | `DurableClient.connect({ store })` | None | Nothing; submits and controls only. |
| Observer | `DurableObserver.connect({ store })` | None, read-only | Nothing; reads status, snapshots, events, and results. |

An owning runtime and shared workers exclude each other on the same database. SQLite stores support only the
owning runtime and a read-only observer.

## What it provides

```text
submit → queued request + event (atomic) → model/tool checkpoints → outcome
                  ↑ restart: reconstruct the loop from committed results ↓
```

| Capability | Summary |
| --- | --- |
| Storage backends | SQLite, Postgres, Drizzle, Prisma, or a custom async store. |
| Deduplicated submissions | One run per `(sessionId, requestId)`; changed content under the same ID conflicts. |
| Checkpoints | Normalized model responses and tool results are committed and reused on recovery. |
| Restart recovery | `runtime.resume()` reschedules unfinished work; completed operations are never repeated. |
| Shared workers | Postgres/Drizzle/Prisma workers claim runs and tasks with renewable leases and fencing. |
| Approvals and questions | Core interactions persist across restarts and accept one response per interaction ID. |
| Progress events | Committed, ordered events with cursors for reconnectable observation. |
| Agent streaming | Opt-in persisted model deltas, grouped by unique attempt IDs. |
| Multimodal prompts | Strings or core `UserMessage` values with image and file parts. |
| Queues and retry | Opt-in session queues, bounded concurrency, and persisted model backoff. |
| Runtime registration | Add agents without a restart; remove idle registrations safely. |
| Custom tasks | Versioned, schema-validated tasks with checkpoints, owned children, timers, signals, and effects. |
| Static task graphs | Persisted DAGs of registered-agent tasks with committed dependency outputs. |
| Goals | Verified objectives across bounded sessions, with continuing rounds and persisted controls. |
| Steering | Deduplicated user input queued at safe model/tool boundaries. |
| Compaction | Recoverable model-context summaries between runs and inside tool loops. |
| Tracing | One trace per durable run across attempts, with application session grouping. |
| Operations | Fail-closed storage, readiness, metrics, limits, and offline backup and restore. |

## Entry points

| Import | Purpose |
| --- | --- |
| `@anvia/durable` | Runtime, worker, client, observer, handles, tasks, goals, errors, and types. |
| `@anvia/durable/sqlite` | `SqliteDurableStore`. Kept separate so the root never imports `node:sqlite`. |
| `@anvia/durable/postgres` | `PostgresDurableStore` over a `pg` pool or connection string. |
| `@anvia/durable/drizzle` | `DrizzleDurableStore`, schema exports, and its generator. |
| `@anvia/durable/prisma` | `PrismaDurableStore`, schema exports, and its generator. |
| `@anvia/durable/protocol` | Browser-safe validators and types used by the HTTP client. |
| `@anvia/durable/maintenance` | Offline `backupSqlite` and `restoreSqlite` for SQLite. |

## Continue

- [Get started](/packages/durable/get-started)
- [Capabilities](/packages/durable/capabilities)
- [Configuration](/packages/durable/configuration)
- [Tasks and graphs](/packages/durable/tasks-and-graphs)
- [Goals](/packages/durable/goals)
- [Compaction](/packages/durable/compaction)
- [Steering](/packages/durable/steering)
- [Tracing](/packages/durable/tracing)
- [HTTP server and client](/packages/durable/http)
- [Operations](/packages/durable/operations)
- [API reference](/packages/durable/api-reference)
- [Releases](/packages/durable/releases)
- [Durable execution guide](/sdk/advanced/durable-execution)
