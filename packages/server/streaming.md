# Streaming

The encoders pull one item at a time from the source async iterator, preserving backpressure instead of collecting a whole run first.

Canceling the response body calls `return()` on the source iterator when available. Whether that stops model or tool work depends on the source implementation; test cancellation through the complete route and hosting platform.

## Client-protocol resume

```ts
import type { ClientResumableEvent } from '@anvia/server'
import {
  createClientStreamResponse,
  createMemoryResumableStreamStore,
  resumeClientStreamResponse,
} from '@anvia/server'

const store = createMemoryResumableStreamStore<ClientResumableEvent>()

return createClientStreamResponse({
  events: agentToClientStream({ events }),
  format: 'jsonl',
  resumable: { streamId, store },
})
```

For a resume request:

```ts
return resumeClientStreamResponse({
  streamId: body.resume.streamId,
  after: body.resume.after,
  store,
  format: 'jsonl',
})
```

Both resume helpers validate `after` as a nonnegative safe integer, defaulting to `0`. Invalid values return
HTTP 400 with `{ error: { code: 'invalid_resumable_after', message } }` instead of opening a stream.
`parseResumableAfter()`, `InvalidResumableAfterError`, and `resumeAfterErrorResponse()` expose the same
contract for custom routes.

The in-memory store is for tests and one-process development. It retains closed streams for
`closedStreamTtlMs` (default 10 minutes) and at most `maxClosedStreams` (default 1000), evicting oldest
first and never evicting running streams. Resuming an evicted stream reports `missing`. Opening an ID whose
stream is still running throws and leaves the running stream untouched; opening a closed ID starts a fresh
stream. Production stores must allocate event IDs consistently, replay after the requested cursor, tail
running streams, and expose terminal status through shared durable storage.

See [resumable streams](/sdk/streaming/resumable-streams) and [deployment](/packages/server/deployment).
