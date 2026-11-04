# Get started

Install the framework-neutral client with Core and Server:

```sh
pnpm add @anvia/client @anvia/core @anvia/server
```

Create a server route that validates the public request and returns framed client events:

```ts
import {
  completionToClientStream,
  parseClientStreamRequest,
} from '@anvia/client'
import { streamCompletion } from '@anvia/core'
import { createClientStreamResponse } from '@anvia/server'

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())
  if (body.type !== 'messages') {
    return new Response('This endpoint does not handle interactions.', { status: 400 })
  }

  return createClientStreamResponse({
    events: completionToClientStream({
      events: streamCompletion({ model, messages: body.messages }),
    }),
    format: 'jsonl',
  })
}
```

Connect from a browser or React controller:

```ts
import { createHttpClientTransport } from '@anvia/client'

export const transport = createHttpClientTransport({
  endpoint: '/api/chat',
  format: 'jsonl',
})
```

Agent routes that support approvals or questions must also handle `interaction_response`, atomically claim the matching server-owned continuation, and start the next linked phase. See [Interactions and continuations](/sdk/agents/interactions).

## Handle malformed frames

Generic readers skip a malformed JSONL line or SSE payload by default and report it through `onParseError`:

```ts
import { createFetchEventTransport } from '@anvia/client/transport'

const transport = createFetchEventTransport<{ prompt: string }, { type: string }>({
  endpoint: '/api/events',
  onParseError(error) {
    console.warn('Skipped malformed frame', error.format, error.line, error.event)
  },
})
```

Set `strict: true` on `readJsonlStream`, `readSseStream`, or `readSseFrames` to throw `EventStreamParseError` instead. Throwing from `onParseError` also aborts the stream. The framed client transport forwards `onParseError`; `DurableClient` streams always parse strictly so a skipped event cannot hide a cursor gap. See [generic event transports](/packages/client/api-reference#generic-event-transport-reference).

## Retried generations

When a server retries an unfinished generation, it sends `message_reset` with the existing `messageId` before new content. `applyClientStreamEvent()` and `useChat()` discard the failed attempt while preserving the message identity; custom reducers must handle the event. Upgrade server and frontend copies of `@anvia/client` together. See [retries and message reset](/packages/client/protocol-and-state#retries-and-message-reset).

## Chat over durable runs

For a durable backend, `@anvia/client/durable-chat` adapts `DurableClient` to the same `useChat` transport contract. It submits only the last user message, maps durable journal events to v3 frames, routes interactions, and resumes by run ID and sequence. See [Durable chat transport](/packages/client/durable-chat).
