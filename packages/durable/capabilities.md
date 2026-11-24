# Capabilities

## Execution model

An agent is registered with a version: an explicit string, or `version: 'auto'` to fingerprint the model,
instructions, sampling settings, tool definitions, and output schema. Submitting a prompt atomically stores a
queued request and a submission event before any work starts. Session history is captured when the request
reaches the head of its session queue.

The runtime uses core's model and tool execution boundaries (`@anvia/core` execution protocol version **5**).
Before a model request or an approved tool call it commits an operation intent. After the operation returns it
commits the normalized result and its event together. Tool checkpoint errors propagate out of the agent loop;
they are never turned into ordinary tool errors for the model to ignore.

On recovery the agent reconstructs its loop from recorded results. This is operation-result replay, not
JavaScript stack restoration. Registered code must stay compatible: keep tool definitions, input and output
parsers, schemas, and approval predicates deterministic and free of side effects. Change the registration
`version` when behavior, model, instructions, or tools change. Restore the original version to resume blocked
old work; automatic checkpoint migrations for agents are not implemented. Unknown versions become
`needs_attention` without calling a model or running a tool. `agentVersion(agent)` produces the same
fingerprint outside `open()`. Automatic versions do not cover tool implementations, guardrails, middleware, or
lifecycle hooks, so bump them explicitly when those change.

## What survives a restart

- Submissions, deduplicated by `(sessionId, requestId)`.
- Completed normalized model responses and tool results, reused during recovery.
- Pending approvals and questions, with a response accepted once per interaction ID.
- Session history, operation IDs, model-turn counts, usage, and progress-event cursors.
- Explicit cancellations, which are never restarted automatically.
- Overflow payloads: prompts, tool results, model outcomes, and large message parts above 64 KiB are stored as
  content-addressed blobs and hydrated on read.

Interrupted model requests may be sent again, and a provider may bill both attempts. Usage records only
completed responses received and committed by the runtime. Provider SDK raw responses are not persisted.

## Tool recovery policies

| Policy | Interrupted operation |
| --- | --- |
| `manual` (default) | Pause as `needs_attention` for external reconciliation; never repeat automatically. |
| `safe` | Repeat the operation. Use for calls whose repetition is acceptable, such as reads. |
| `idempotent` | Repeat with the same `ToolCallContext.operationId`. The tool must pass it to a service that enforces deduplication. |

A committed tool result is never executed again, whatever the policy. Recovery policies stored with a run
cannot be relaxed by changing the current registration.

The critical ambiguous interval is an external action that succeeds before the process dies and the result
commits. Durable storage cannot give exactly-once external effects. After inspecting the actual outcome,
reconcile explicitly with `run.resolveTool(operationId, output)`. `ToolCallContext.operationId` is the full
stable external key (run ID plus checkpoint key); the event's `operationId` and the snapshot's
`blockedOperation` are run-local keys used for inspection and reconciliation.

`run.retry()` reattempts a failed or blocked run subject to the same recovery checks and does not override
manual recovery. It is rejected once a later submission has started and advanced the session. An explicit
retry resets the attempt counters of unfinished model operations; completed results stay intact.

## Supported agent features

Static `Document` context and `skills` need no marker; skills flatten into instructions and static tools.
Everything else needs an explicit admission marker on the registration, and replay behaviour follows that
marker:

| Feature | Registration marker | Replay behaviour |
| --- | --- | --- |
| Memory | `memory: { mode: 'recorded' }` | Reads once before the first model call; writes are keyed operations. Needs a versioned store. |
| Live vector context | `context: { mode: 'recorded' }` | Each retrieval is recorded before the model call and reused. |
| Middleware | `middlewares: { mode: 'pure' }` | Must be deterministic; replay compares transformed requests and tool inputs. |
| Guardrails | `guardrails: { mode: 'record' }` | Each check outcome is recorded before it is applied. |
| Control hooks | `hooks: { mode: 'record' }` | `onToolCall`, `onRunStart`, and `onCompletionCall` decisions are recorded before use. |
| Lifecycle callbacks | `lifecycle: { mode: 'observe' }` | Runs at most once per step; not replayed after a restart. |
| MCP servers | `mcpServers: { mode: 'pinned' }` | Server and tool fingerprints are pinned at submission. |
| Provider tools | `providerTools: { mode: 'stateless' }` | The provider keeps no state between calls; definitions are part of the stored request. |
| Dynamic tool indexes | `toolIndexes: { mode: 'recorded' }` | Each model call's selected tools are recorded; the search is not repeated. |

Without the marker, the feature is rejected at registration and the error names it. Agent-level `retries` are
rejected because every durable run executes with retries disabled; configure `modelRetry` on the registration
instead.

Recorded memory has further limits: it cannot be combined with registration compaction, a run that pauses for
a human interaction fails under the marker, and it is rejected in graph tasks and owned agent tasks because
those use synthetic session IDs. Adapter packages implement the versioned contract.

New attempts invoke observers, but replayed model, tool, and context checkpoints do not emit duplicate spans
or usage. Observers are not the authoritative journal; see [Tracing](/packages/durable/tracing).

## Run states

`queued`, `retry_wait`, `pending`, `running`, `waiting`, `needs_attention`, `completed`, `failed`, and
`cancelled`. `waiting` means an approval or question is pending; `needs_attention` means a recovery block
(version mismatch, an uncertain manual tool, or an unresolved memory write); `retry_wait` means a persisted
model backoff deadline.

## Deployment scope

- **SQLite:** one runtime owner per database file. A second live owner is rejected; after a crash on the same
  host, ownership recovers once the old PID no longer exists. Use a dedicated database on a local filesystem.
  `:memory:` is useful in tests but does not survive restart. Workers and clients are unavailable.
- **Postgres, Drizzle, Prisma:** either one owning runtime or several shared workers. Workers claim runs and
  tasks with renewable leases, fence writes with the claim, and stop work whose lease was lost. A store-only
  `DurableClient` submits and controls work without holding a lease, and a read-only `DurableObserver` reads it.
- Each session runs one run at a time. Opt-in persisted successors wait in FIFO order; cross-session
  concurrency is bounded by `maxConcurrentRuns`. [Queued steering](/packages/durable/steering) applies input at
  safe execution boundaries.
- Not yet available: Pipeline and team recovery, Studio integration, retention, general migration tooling,
  execution deadlines, and blob garbage collection.
- The database holds prompts, normalized responses, tool arguments and results, and interaction state. Keep it
  in application-private storage; retention, encryption, authentication, and authorization are yours.

## Schema versions

The current SQLite schema is **12**. Schemas 1–12 upgrade when the runtime acquires ownership. Schema 5 added
conversation compaction, 6 active-loop compaction, 7 goal session exhaustion, 8 shared message histories, 9
steering checkpoints, 10–11 blob overflow and escaping, and 12 oversized prompts. Postgres can create its
tables with `{ schema: 'create' }`, otherwise it verifies them; Drizzle and Prisma always verify the schema you
generated and never migrate it. Older engines reject newer schemas; downgrading a database is
unsupported. Upgrade Core and Durable together for execution protocol 5. See
[Operations](/packages/durable/operations).

## Custom stores

`DurableStore` is an **async** transactional contract. A custom implementation must provide exclusive
ownership (`acquire()`), read-only observation (`connect()`), atomic writes, detached read values, ordered
event cursors, and the same deduplication and history semantics. Stores that admit several writers also
implement `join()`, `claim()`, `renew()`, `release()`, and `tx.assertClaim()`; stores with claims must
serialise session submissions with `lockSession()`.

`DurableTransaction` methods return promises, `transaction(callback)` takes an async callback, serialises
concurrent transactions, and rejects nested ones. Blob access is `tx.blobs(fn)`, `putBlob()`, and `getBlob()`.
Callbacks must not perform external work or retain their transaction handle. Store failures are fatal.

## Goals, compaction, and steering

[Goals](/packages/durable/goals) add verified continuation across bounded agent sessions.
[Compaction](/packages/durable/compaction) is configured on registrations and preserves canonical
history. [Steering](/packages/durable/steering) persists new user input for the next safe boundary;
approvals and uncertain effects remain explicit decisions. Static graph runs are not compacted.
