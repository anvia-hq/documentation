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

The in-memory store is for tests and one-process development. Production stores must allocate event IDs consistently, replay after the requested cursor, tail running streams, and expose terminal status through shared durable storage.

See [resumable streams](/sdk/streaming/resumable-streams) and [deployment](/packages/server/deployment).
