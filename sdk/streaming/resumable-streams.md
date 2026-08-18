# Resumable streams

A resumable client stream lets a browser reconnect after navigation or a temporary connection loss without starting a second agent run.

## Start and resume through one route

```ts
import {
  agentToClientStream,
  parseClientStreamRequest,
} from '@anvia/client'
import {
  createClientStreamResponse,
  createMemoryResumableStreamStore,
  resumeClientStreamResponse,
  type ClientResumableEvent,
} from '@anvia/server'

const store = createMemoryResumableStreamStore<ClientResumableEvent>()

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())

  if (body.resume !== undefined) {
    await authorizeResume(request, body.resume.streamId)
    return resumeClientStreamResponse({
      streamId: body.resume.streamId,
      after: body.resume.after,
      store,
      format: 'jsonl',
    })
  }

  if (body.type !== 'messages') {
    return new Response('Interaction responses are not enabled', { status: 400 })
  }
  await authorizeStart(request, body.messages)
  const streamId = crypto.randomUUID()

  return createClientStreamResponse({
    events: agentToClientStream({
      events: agent.stream({ messages: body.messages }),
      ...(body.metadata === undefined ? {} : { metadata: body.metadata }),
    }),
    format: 'jsonl',
    resumable: { streamId, store },
  })
}
```

The store must live outside the route so later requests can find the stream. A stream ID and cursor are transport positions, not proof of access; authorize both start and resume paths.

## Resume with React

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'

const transport = createHttpClientTransport({
  endpoint: `/api/threads/${threadId}/chat`,
  format: 'jsonl',
})

const chat = useChat({
  transport,
  resume: { key: threadId },
})
```

By default, the hook stores the stream ID, latest event ID, and UI messages in `sessionStorage`. Use `storage: 'localStorage'` to survive a browser session, or `auto: false` to require an explicit `chat.resume()`.

## Use durable storage in production

`createMemoryResumableStreamStore()` is process-local and loses records on restart. A production `ResumableStreamStore` should use shared storage and implement `open`, ordered `append`, replay-and-tail `subscribe`, `status`, and `close`.

Stored client events can still contain user text, model output, tool state, and public errors. Apply encryption, tenant isolation, access controls, and short retention. Resumable transport storage is separate from [agent memory](/sdk/memory).
