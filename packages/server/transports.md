# Transports

JSONL and SSE carry the same event values with different framing.

## JSONL

```ts
return createEventStreamResponse({ events, format: 'jsonl' })
```

Each event is serialized to JSON and followed by `\n`. The response content type is `application/x-ndjson; charset=utf-8`. JSONL is compact and is the default for Anvia React clients.

Use `jsonl.serialize` only when both ends agree on a custom representation:

```ts
createEventStreamResponse({
  events,
  jsonl: {
    serialize: (event) => JSON.stringify(event),
  },
})
```

The serializer also receives the final server error event when iteration throws. Well-known diagnostic fields (`code`, `retryable`, JSON-safe `details`) survive on JSONL and SSE error events — including errors from runtime-specific subclasses whose prototype fields `JSON.stringify` would drop — and non-JSON-safe thrown values degrade to a `{ message }` payload. The `errorEvent` helper is public.

## Server-Sent Events

```ts
return createEventStreamResponse({
  events,
  format: 'sse',
  sse: {
    eventName: (event) => 'type' in event ? String(event.type) : undefined,
    retry: 3_000,
  },
})
```

SSE writes serialized JSON as `data:` lines and uses `text/event-stream; charset=utf-8`. `eventName` can be static or computed per event. The implementation validates event names and retry values before streaming.

The package does not emit heartbeat comments. Add a heartbeat at the application event-source layer when a proxy requires traffic during long idle periods.

## Error responses

A thrown source error is serialized as a final stream error event; that is not an HTTP error response.
`createDurableHandler()` instead rejects a request before streaming with `{ error, code, field? }`:
`payload_too_large` is HTTP 413, `capacity_exceeded` is HTTP 429, and an oversized request body is 413 with
field `request.body` and the configured `limit`. `maxBodyBytes` is the binding ceiling for uploads. See
[durable handler errors](/packages/server/api-reference#durable-handler-errors).

Client-protocol responses validate outgoing events, including `message_reset` since Client 1.6.0. Keep the
server's Client dependency aligned with the browser client that consumes the stream.

## Custom response metadata

`headers`, `status`, and `statusText` pass through to the `Response`. Existing transport headers are respected rather than overwritten. Authentication and CORS headers remain route-owned.

Pair client-protocol responses with `createHttpClientTransport({ format })` from `@anvia/client`. Generic stream readers are available from `@anvia/client/transport`.
