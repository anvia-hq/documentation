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
  createMemoryResumableStreamStore,
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
const store = createMemoryResumableStreamStore<MyEvent>()
const events = createResumableStream({ events: source, id: streamId, store })
const replay = resumeStreamEvents({ id: streamId, after: 17, store })
```

`ResumableStreamStore` implements `open`, `append`, `subscribe`, `status`, and `close`. Use durable shared storage when streams must survive restarts or be resumed on another replica.

Return to the [`@anvia/server` overview](/packages/server).
