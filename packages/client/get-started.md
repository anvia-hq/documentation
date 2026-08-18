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
