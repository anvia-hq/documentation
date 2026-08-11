# Streaming

The encoder pulls one item at a time from the source async iterator. This preserves backpressure at the response stream boundary instead of first collecting an entire agent run.

## Cancellation

Canceling the returned `ReadableStream` calls `return()` on the source iterator when it exists. Whether that stops model or tool work depends on the source iterator's cancellation implementation. Keep generation ownership visible and test cancellation through the complete route and hosting platform.

## Error events

If source iteration throws, JSONL and SSE emit one terminal error event and close:

```json
{"type":"error","error":{"name":"Error","message":"Provider unavailable"}}
```

Stacks are intentionally omitted for native `Error` values. Unknown thrown values pass through to the serializer, so application code should avoid throwing sensitive objects.

## Resumable flow

```ts
const store = createMemoryResumableStreamStore<UIStreamEvent>()

return createUIStreamResponse(events, {
  resumable: {
    id: runId,
    store,
  },
})
```

The resumable wrapper opens the stream, drains the producer in the background, persists numbered records, and yields `stream_start`, `stream_event`, and `stream_end` envelopes. If the response subscriber disconnects, the producer can continue writing to the store so another request can resume.

```ts
return createUIStreamResponse({
  resume: {
    streamId: body.resume.streamId,
    after: body.resume.after,
    store,
  },
})
```

Use unique IDs. Opening an existing ID resets the in-memory implementation. Production stores must allocate event IDs consistently, replay records after the requested cursor, keep subscribers informed while running, and expose a terminal status.

See [resumable streams](/sdk/streaming/resumable-streams) and [deployment](/packages/server/deployment).
