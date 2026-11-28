# Shutdown and errors

The bridge observes every failure through `onError` without interrupting delivery, and `service.stop()` owns the full shutdown order. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Errors

`onError(error, context)` observes failures with a `context.stage` of `filter`, `prepare`, `acknowledge`, `interaction`, `agent`, or `delivery`. Observed errors never interrupt delivery: the user receives `errorMessage` (default `Sorry, I couldn't process that message.`, disable with `errorMessage: false`). An outcome with no text and no attachments is answered with `emptyResponseMessage` (default `I couldn't produce a response.`).

When the service's signal is already aborted (during `service.stop()`), a failing run is not reported and gets no failure reply; the bridge only cleans up its placeholder. When the placeholder message itself cannot be delivered, the failure is reported with the `delivery` stage and no further reply is attempted.

## Run timeouts

`runTimeoutMs` bounds each `generate`, `stream`, and `resume` call. The default is five minutes; pass `Infinity` to disable the bound, and values above `2147483647` (the timer maximum) are rejected when the service is created. A run that exceeds it has its signal aborted and is reported with the `agent` stage, then the user receives `errorMessage`, so a hung model call cannot block the conversation queue or `service.stop()`.

```ts
const service = createChannelAgent({
  channel,
  agent,
  runTimeoutMs: 2 * 60_000,
})
```

## Graceful shutdown

`service.stop()` signals in-flight runs to abort and waits for (drains) queued conversation work before stopping the adapter — queued work is not discarded, it runs to its abort check. Stop the service before closing the databases it may still use:

```ts
try {
  await service.stop()
} finally {
  interactionStore.close()
  // await memoryClient.close() // when the agent uses a closable memory store
}
```

Make shutdown idempotent when registering both `SIGINT` and `SIGTERM` handlers. On shutdown, an already-sent streaming placeholder is deleted or replaced with a short `(interrupted)` note instead of being left dangling.

## Continue with

- [Approvals and interactions](/channels/channel-agent/interactions) — durable stores worth closing on shutdown.
- [End-to-end guide](/channels/end-to-end) — the full shutdown checklist in a complete program.
