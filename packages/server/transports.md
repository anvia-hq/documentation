# Transports

JSONL and SSE carry the same event values with different framing.

## JSONL

```ts
return createEventStream(events, { format: 'jsonl' })
```

Each event is serialized to JSON and followed by `\n`. The response content type is `application/x-ndjson; charset=utf-8`. JSONL is compact and is the default for Anvia React clients.

Use `jsonl.serialize` only when both ends agree on a custom representation:

```ts
createEventStream(events, {
  jsonl: {
    serialize: (event) => JSON.stringify(event),
  },
})
```

The serializer also receives the final server error event when iteration throws.

## Server-Sent Events

```ts
return createEventStream(events, {
  format: 'sse',
  sse: {
    eventName: (event) => 'type' in event ? String(event.type) : undefined,
    retry: 3_000,
  },
})
```

SSE writes serialized JSON as `data:` lines and uses `text/event-stream; charset=utf-8`. `eventName` can be static or computed per event. The implementation validates event names and retry values before streaming.

The package does not emit heartbeat comments. Add a heartbeat at the application event-source layer when a proxy requires traffic during long idle periods.

## Custom response metadata

`headers`, `status`, and `statusText` pass through to the `Response`. Existing transport headers are respected rather than overwritten. Authentication and CORS headers remain route-owned.

Pair JSONL with `readJsonlStream` and SSE with `readSseStream` from [`@anvia/react`](/packages/react/api-reference#transports).
