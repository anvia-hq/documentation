# Shutdown and errors

The bridge observes every failure through `onError` without interrupting delivery, and `service.stop()` owns the full shutdown order. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Errors

`onError(error, context)` observes every failure with a `context.stage` of `filter`, `prepare`, `acknowledge`, `interaction`, `agent`, or `delivery`. Observed errors never interrupt delivery: the user receives `errorMessage` (default `Sorry, I couldn't process that message.`, disable with `errorMessage: false`). An outcome with no text and no attachments is answered with `emptyResponseMessage`.

## Graceful shutdown

`service.stop()` aborts in-flight and queued runs, stops the adapter, and drains queued conversations. Stop the service before closing the databases it may still use:

```ts
try {
  await service.stop()
} finally {
  interactionStore.close()
}
```

Make shutdown idempotent when registering both `SIGINT` and `SIGTERM` handlers. On shutdown, an already-sent streaming placeholder is deleted or replaced with a short `(interrupted)` note instead of being left dangling.

## Continue with

- [Approvals and interactions](/channels/channel-agent/interactions) — durable stores worth closing on shutdown.
- [End-to-end guide](/channels/end-to-end) — the full shutdown checklist in a complete program.
