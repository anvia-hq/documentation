# Progress events and streaming

Every committed state change is an ordered `DurableEvent` with a global `sequence`. You can reconnect at any
time without missing or repeating events.

## 1. Reconnect from a snapshot

```ts
const run = await runtime.getRun(runId)
const snapshot = await run.snapshot()
render(snapshot)
for await (const event of run.stream({ after: snapshot.cursor, abortSignal })) {
  renderEvent(event)
}
```

A snapshot atomically contains the run, its saved operations (including intermediate model and tool
results), and a cursor. Starting after it is gap-free. Alternatively resume after the last event your
application successfully applied. The iterator reads bounded pages, polls while idle, and finishes when the
run is completed, failed, or cancelled. It stays open through approvals and recovery blocks. An unusable
cursor ahead of the store throws a `TypeError`.

Base events are `submitted`, `status`, `model_started`, `model_completed`, `tool_started`, and
`tool_completed`. `model_completed` carries the normalized response.

## 2. Persist model deltas

Set `stream: true` on the registration to execute with `agent.stream()`. The model must support streaming:

```ts
agents: [{ agent: assistant, version: '1', stream: true }]
```

The iterator then also yields `model_attempt_started`, `model_delta`, and `model_attempt_failed`. Each has an
`operationId` and a unique `attemptId`. A `model_delta.event` is a normalized core generation event, such as
`{ type: 'text_delta', turn: 1, delta: 'Hello' }`. Deltas are persisted before any subscriber reads them. The
option is captured at submission and also applies to graph nodes and owned agent tasks.

```ts
let partial = ''
for await (const event of run.stream()) {
  const data = event.data as { event?: { type?: string; delta?: string } }
  if (event.type === 'model_attempt_started') partial = ''
  if (event.type === 'model_delta' && data.event?.type === 'text_delta') {
    partial += data.event.delta ?? ''
  }
  if (event.type === 'model_attempt_failed') partial = ''
}
```

## 3. Treat partial output as provisional

- Replace partial output when a new `model_attempt_started` arrives for the same operation.
- Discard it on `model_attempt_failed` or cancellation. `failureKind` is `model` for execution or validation
  errors and `local` for observer or persistence failures.
- A crash or shutdown can leave an attempt without a failure event. Recovery starts a **new** attempt rather
  than continuing the old stream.
- Only `model_completed`, with the same attempt ID, is the checkpoint. It commits before local completion
  observers run, so a later observer failure fails the run but keeps the response.
- Completed checkpoints are reused without duplicate deltas.
- Snapshots do not include partial token text. To rebuild it, replay from sequence zero or keep your own
  accumulator and resume after its last applied cursor.
- Structured output follows core's buffering: text is not exposed before schema validation, and the saved
  result arrives in `model_completed`.

Persisting each delta adds SQLite writes and retained event data, and `limits.maxPayloadBytes` applies to
each delta. These events are not the token-delta chat protocol used by the standard client transport.

## 4. Stream over HTTP

`@anvia/server/durable` serves runs as SSE and `@anvia/client/durable` reconnects with validated cursors. See
[HTTP server and client](/packages/durable/http).

Next: [tools, approvals, and recovery](/sdk/advanced/durable-execution/recovery).
