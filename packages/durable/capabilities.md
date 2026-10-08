# Capabilities

## Execution model

An agent is registered with an explicit version. Submitting a prompt atomically stores a queued request and
a submission event before any work starts. Session history is captured when the request reaches the head of
its session queue.

The runtime uses core's model and tool execution boundaries (`@anvia/core` execution protocol version 2).
Before a model request or an approved tool call it commits an operation intent. After the operation returns
it commits the normalized result and its event together. Tool checkpoint errors propagate out of the agent
loop; they are never turned into ordinary tool errors for the model to ignore.

On recovery the agent reconstructs its loop from recorded results. This is operation-result replay, not
JavaScript stack restoration. Registered code must stay compatible: keep tool definitions, input and output
parsers, schemas, and approval predicates deterministic and free of side effects. Change the registration
`version` when behavior, model, instructions, or tools change. Restore the original version to resume blocked
old work; automatic checkpoint migrations for agents are not implemented. Unknown versions become
`needs_attention` without calling a model or running a tool.

## What survives a restart

- Submissions, deduplicated by `(sessionId, requestId)`.
- Completed normalized model responses and tool results, reused during recovery.
- Pending approvals and questions, with a response accepted once per interaction ID.
- Session history, operation IDs, model-turn counts, usage, and progress-event cursors.
- Explicit cancellations, which are never restarted automatically.

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

## Supported and unsupported agent features

Supported:

- Static local tools and instructions.
- Approvals and questions through core's interaction protocol.
- JSON-serializable structured output.
- Provider-neutral completion models, including streaming models with `stream: true`.
- Persisted session history, including image and file prompts.

Rejected at registration because they need additional persistence boundaries: agent memory, lifecycle
callbacks, middleware, guardrails, context sources, MCP servers, provider tools, and dynamic tool indexes.
Durable session history replaces the agent's memory store. Observability callbacks may run again during
reconstruction and must be safe to repeat; they are not the authoritative journal.

## Run states

`queued`, `retry_wait`, `pending`, `running`, `waiting`, `needs_attention`, `completed`, `failed`, and
`cancelled`. `waiting` means an approval or question is pending; `needs_attention` means a recovery block
(version mismatch or an uncertain manual tool); `retry_wait` means a persisted model backoff deadline.

## Scope and limits

- One runtime owner per SQLite database. A second live owner is rejected. After a crash on the same host,
  ownership recovers once the old PID no longer exists; PID reuse conservatively blocks recovery.
- Use a dedicated database on a **local filesystem**. Network filesystems, ambiguous shared PID namespaces,
  worker leases, and distributed execution are unsupported. `:memory:` is useful in tests but does not
  survive restart.
- Each session runs one run at a time. Opt-in persisted successors wait in FIFO order; cross-session
  concurrency is bounded by `maxConcurrentRuns`. Mid-run steering is not supported.
- Not yet available: Pipeline and team recovery, compaction, Studio integration, Postgres, retention,
  general migration tooling, execution deadlines, and distributed workers.
- The database holds prompts, normalized responses, tool arguments and results, and interaction state. Keep it
  in application-private storage; retention, encryption, authentication, and authorization are yours.

## Schema versions

SQLite schema version 2 added graphs, version 3 added custom tasks, and version 4 added persisted streaming
attempts. A newer engine upgrades older schemas when it acquires ownership. Older engines reject a newer
schema, and downgrading a database is unsupported. See [Operations](/packages/durable/operations).

## Custom stores

`DurableStore` is a synchronous transactional contract. A custom implementation must provide exclusive
ownership, atomic writes, detached read values, validation, ordered event cursors, and the same deduplication
and history semantics. Since 0.1.1 stores also implement `pendingCounts()` and `operationCount()` inside
transactions and `metrics()` outside them, and all store failures are fatal. Transaction callbacks must not
perform external work, return promises, or retain their transaction handle.
