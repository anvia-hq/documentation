# Configuration

## Runtime options

`DurableRuntime.open(options)` takes a `DurableRuntimeOptions` object:

| Option | Default | Purpose |
| --- | --- | --- |
| `store` | required | A `DurableStore`, normally `new SqliteDurableStore(path)`. |
| `agents` | `[]` | `DurableAgentRegistration[]` for agent runs, graphs, and owned agents. |
| `tasks` | `[]` | Tasks created with `defineTask()`. Fixed at open. |
| `maxConcurrentRuns` | `4` | Simultaneous agent executions across sessions (integer, 1 to 1000). |
| `maxConcurrentTasks` | `4` | Simultaneous custom-task phases, independent of agent runs (1 to 1000). |
| `limits` | see below | Admission, payload, and operation limits. |
| `onFatalError` | none | Called once after a fatal storage or scheduler failure. |

## Agent registrations

```ts
agents: [
  {
    agent: researcher,
    version: '1',
    stream: true,
    toolRecovery: { search: 'safe', createTicket: 'idempotent' },
    modelRetry: { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 30_000 },
  },
]
```

| Field | Purpose |
| --- | --- |
| `agent` | An `Agent` with a unique `id`. |
| `version` | Required nonblank string. Bump it when code, model, tools, schemas, or instructions change incompatibly. |
| `stream` | Execute with `agent.stream()` and persist generation deltas. Needs a streaming-capable model. |
| `toolRecovery` | Map of tool name to `'safe'`, `'idempotent'`, or `'manual'`. Unlisted tools are `manual`. Every named tool must exist on the agent. |
| `modelRetry` | Opt-in persisted retry for model errors. |

Registration is validated eagerly: duplicate IDs, unsupported agent options, unknown recovery tools, invalid
policies, and non-streaming models with `stream: true` throw at `open()` or `registerAgents()`.

### Registering and unregistering at runtime

`runtime.registerAgents(registrations)` validates the whole batch before adding any agent, using the same
checks as `open()`. It rejects duplicate or already-registered IDs with `DurableConflictError`, never
replaces an implementation, and leaves running work and concurrency limits unchanged. Custom tasks and graph
submissions see new registrations immediately. Give each immutable configuration its own agent ID.

`runtime.unregisterAgent(id)` removes an idle registration and returns whether it existed. It throws
`DurableConflictError` while any run needs the agent: queued, pending, running, retry-waiting, waiting for
approval, needing attention, or a cancelled attempt that is still settling. Removal preserves journal history,
results, and deduplication records. Re-register compatible code before retrying a failed run or submitting or
spawning new work; a future task phase must not depend on an unloaded registration unless the host restores it.

Registrations are process-local. At startup, open without agents, discover unfinished runs with
`listRuns()`, restore their exact registrations, then call `resume()`. Adding a missing registration does
not automatically retry `needs_attention` runs; recovery remains an explicit `retry()` decision. Custom task
definitions still must be passed to `open()`.

## Streaming model output

With `stream: true`, `run.stream()` additionally yields `model_attempt_started`, `model_delta`, and
`model_attempt_failed`. Each carries an `operationId` and a unique `attemptId`. A `model_delta` wraps a
normalized core generation event such as `{ type: 'text_delta', turn: 1, delta: 'Hello' }`. Deltas are
persisted before subscribers can read them.

`model_completed` carries the same attempt ID and the validated normalized response; only that response is a
model checkpoint, and it commits before local completion observers run. A later observer failure fails the
run while retaining the checkpoint. `model_attempt_failed.failureKind` is `model` for execution or validation
errors and `local` for observer or persistence failures.

Partial output is provisional. Replace the previous attempt's partial output when a new
`model_attempt_started` arrives for the same operation, and discard it on `model_attempt_failed` or
cancellation. A crash or shutdown can leave an attempt without a failure event; recovery starts a new attempt
rather than continuing the old token stream. Completed checkpoints are reused without duplicate deltas.

Snapshots contain completed responses and the latest operation attempt ID but not partial token text.
Reconnect from the last event cursor you applied, or replay from zero to rebuild partial output. Starting
after a fresh snapshot's cursor skips earlier deltas. Structured output follows core's buffering rules: text
is not exposed before schema validation, and the saved result arrives in `model_completed`. The option is
captured at submission and also applies to graph nodes and owned agent tasks. Each persisted delta adds a
SQLite write and retained event data, and `limits.maxPayloadBytes` applies to each delta.

## Multimodal prompts

A prompt is a nonblank string or a core `UserMessage`. Media-only user messages are accepted; empty
messages, non-user roles, and invalid content parts are rejected. The model must support the media type.
Durable execution validates against the core contracts but does not fetch or transform media.

- The same format works in `submitGraph` tasks and `ctx.spawnAgent`. Graph dependency results are appended as
  text without replacing media parts or user metadata.
- Prompts and media are persisted for restart, retry, and later session history. Equivalent JSON prompts
  deduplicate under one request ID regardless of key order; changed content or metadata conflicts.
- Inline `data` captures bytes. URL images stay external references that must remain accessible and stable for
  retries and future turns.
- Base64 increases payload size, and history and checkpoints also count toward `limits.maxPayloadBytes`.
  Size it, and the HTTP bridge's `maxBodyBytes`, for your upload policy.
- Journals containing structured prompts cannot be read by releases older than 0.3. Code that reads
  `run.prompt` must handle both strings and user messages.

## Queues and scheduling

`runtime.submit(input, { enqueue: true })` persists a successor behind the unfinished run in the same
session. Without `enqueue`, submitting into an unfinished session fails; repeating a request ID returns the
original run either way. Only the oldest unfinished run in a session is eligible. A queued run receives the
latest completed session history when it starts; failed or cancelled predecessors add no partial history.
Approvals and `needs_attention` pause their session queue while freeing global capacity. Cancelling an active
run keeps its slot until its callbacks settle.

## Model retry

`modelRetry` retries errors thrown within the core completion attempt, including permanent provider errors
and capability, response, and structured-output validation errors, up to `maxAttempts`. It does not retry
observer, local post-processing, checkpoint, quota, model-turn-budget, or tool failures, and there is no
transient-error classifier. The initial request counts toward `maxAttempts`, and the count is persisted
before the attempt starts, so a crash consumes an attempt.

Backoff doubles from `initialDelayMs`, capped at `maxDelayMs`, without jitter. The run enters `retry_wait`
with `nextAttemptAt`, releasing its slot but preserving session order. Deadlines survive restart, and the
saved policy is not affected by registration changes. An exhausted budget needs an explicit `run.retry()`.
Scheduling timers do not keep a Node process alive; the host must stay running.

## Limits

```ts
limits: {
  maxPendingRuns: 10_000,
  maxPendingTasks: 10_000,
  maxPayloadBytes: 1_048_576,
  maxOperations: 10_000,
}
```

All four are positive integers with the defaults shown. See [Operations](/packages/durable/operations#admission-and-payload-limits).
