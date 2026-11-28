# `@anvia/server` API reference

```ts
import {
  createClientStreamResponse,
  resumeClientStreamResponse,
  createEventStreamResponse,
  resumeEventStreamResponse,
  createJsonlStream,
  createSseStream,
  createResumableStream,
  resumeStreamEvents,
  resumeAfterErrorResponse,
  createMemoryResumableStreamStore,
  InvalidResumableAfterError,
  parseResumableAfter,
} from '@anvia/server'
```

## Client-protocol responses

```ts
createClientStreamResponse({
  events,
  format,
  headers,
  status,
  statusText,
  streamId,
  resumable: { streamId, store },
  metadataSchema,
  dataSchemas,
  sse: { retry },
})

resumeClientStreamResponse({
  streamId,
  after,
  store,
  format,
  metadataSchema,
  dataSchemas,
})
```

These helpers validate `ClientStreamEvent` values, add protocol frames, and set `x-anvia-stream-protocol` for `createHttpClientTransport()`.

## Generic responses

```ts
createEventStreamResponse({ events, format, headers, status, statusText, resumable, jsonl, sse })
resumeEventStreamResponse({ streamId, after, store, format, headers, jsonl, sse })
```

`format` is `'jsonl' | 'sse'` and defaults to JSONL. `createJsonlStream({ events, serialize })` and `createSseStream({ events, eventName, serialize, retry })` return byte streams without constructing a response.

## Generic resumable streams

```ts
const store = createMemoryResumableStreamStore<MyEvent>({
  closedStreamTtlMs: 10 * 60 * 1000,
  maxClosedStreams: 1_000,
})
const events = createResumableStream({ events: source, id: streamId, store })
const replay = resumeStreamEvents({ id: streamId, after: 17, store })
```

`ResumableStreamStore` implements `open`, `append`, `subscribe`, `status`, and `close`. Use durable shared storage when streams must survive restarts or be resumed on another replica.

Both `resumeClientStreamResponse()` and `resumeEventStreamResponse()` validate `after` with
`parseResumableAfter()`: it defaults to `0` when omitted and must otherwise be a nonnegative safe integer.
Negative, fractional, non-number, and unsafe values produce a 400 response with
`{ error: { code: 'invalid_resumable_after', message } }` instead of opening a stream. The same helpers are
exported so route code can reuse the contract: `parseResumableAfter(value)` returns the normalized cursor or
throws `InvalidResumableAfterError` (with `code`, `status`, and `value`), and `resumeAfterErrorResponse(error)`
formats the JSON response. `resumeStreamEvents()` throws the typed error before yielding any envelope.

`MemoryResumableStreamStoreOptions` bounds retained closed streams. `closedStreamTtlMs` defaults to 600000
(10 minutes) and `maxClosedStreams` defaults to 1000; both are clamped to at least 1. Closed streams are
evicted lazily on the next `open`, `subscribe`, `status`, or `close`, oldest first when the cap is exceeded.
Running streams never count toward the cap and are never evicted. Resuming an evicted stream reports
`missing`, so size retention for your reconnection window. Opening an ID that is still running throws and
leaves the existing stream and its history untouched; opening a closed ID starts a fresh running stream.

## Durable handler errors

`createDurableHandler()` is exported from `@anvia/server/durable`. Payload and capacity rejections return a
JSON body of `{ error, code, field? }`: `payload_too_large` maps to HTTP 413 and `capacity_exceeded` maps to
HTTP 429. A request body over `maxBodyBytes` returns 413 with code `payload_too_large`, field `request.body`,
and the configured `limit`. `maxBodyBytes` is the binding ceiling for uploads and defaults to 64 KiB. A prompt
over `maxPayloadBytes` is rejected at submission with 413 (`field: 'run.prompt'`) and no run is created. A run
whose inherited history or input exceeds the limit when it starts ends in terminal `failed`; it does not wait
in `needs_attention`. See
[HTTP server and client](/packages/durable/http#routes) for routes and authorization.

## Client event compatibility

Client-protocol responses validate every `ClientStreamEvent` before framing it. Since `@anvia/client` 1.6.0
that includes `message_reset`, emitted when a retried unfinished generation must discard its partial attempt.
Upgrade the server's Client dependency and browser clients together; an older validator rejects the event.
Generic event responses are unaffected because they do not claim the Anvia client protocol.

Return to the [`@anvia/server` overview](/packages/server).
