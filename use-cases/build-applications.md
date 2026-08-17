# Build applications

Anvia applications keep provider credentials and agent execution on the server, then send normalized runtime events to the client. The client owns interaction state; the server remains the trusted runtime boundary.

## 1. Install the application packages

Keep every Anvia package on the same release-candidate channel:

```bash
pnpm add @anvia/core@rc @anvia/client@rc @anvia/openai@rc @anvia/server@rc @anvia/react@rc
```

`@anvia/client` defines the public protocol and transport, `@anvia/server` returns its HTTP stream, and `@anvia/react` maintains UI state.

## 2. Construct the agent on the server

Provider credentials must never enter the browser bundle. Create the client, model, and agent in a server-only module.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly and concisely.',
  maxTurns: 4,
})
```

In production, validate required environment values during startup so a missing credential fails before the first request.

## 3. Expose an agent stream

The default React request contains normalized core messages. Pass those messages directly to `agent.stream()` and return the events as JSONL.

```ts
import { agentToClientStream, parseClientStreamRequest } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'
import { supportAgent } from './support-agent'

export async function POST(request: Request) {
  const user = await authenticate(request)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = parseClientStreamRequest(await request.json())

  return createClientStreamResponse({
    events: agentToClientStream({
      events: supportAgent.stream({ messages: body.messages }),
      ...(body.metadata === undefined ? {} : { metadata: body.metadata }),
    }),
    format: 'jsonl',
  })
}
```

Authenticate before running the agent. If tools read private data or perform actions, capture the authenticated user in request-scoped tool handlers and enforce permissions there as well.

JSONL is the default format and works with Anvia's React transport. Use `{ format: 'sse' }` when an existing client requires server-sent events.

## 4. Consume the stream in React

`useChat()` converts local UI messages into core messages, sends the request, consumes runtime events, and updates the current assistant message.

```tsx
import { useChat } from '@anvia/react'
import { createHttpClientTransport } from '@anvia/client'
import { useState } from 'react'

const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })

export function Chat() {
  const chat = useChat({ transport })
  const [input, setInput] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void chat.sendMessage({ text: input })
        setInput('')
      }}
    >
      {chat.messages.map((message) => (
        <p key={message.id}>
          {message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')}
        </p>
      ))}

      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <button disabled={chat.status === 'streaming'} type="submit">
        Send
      </button>
    </form>
  )
}
```

The hook also exposes `stop()`, `regenerate()`, `reset()`, stream events, context usage, errors, and optional approval or question state.

## 5. Understand the wire boundary

The default request shape is intentionally small:

```ts
type ClientStreamRequest = {
  messages: readonly Message[]
  metadata?: JsonObject
  resume?: {
    streamId: string
    after: number
  }
}
```

Read `body.messages` at the server boundary rather than assuming a single `{ message }` string. Use `metadata` only for non-sensitive request context, and validate any values before trusting them.

## Next

Add narrow application actions with [Tools](/sdk/tools), then review [Production operations](/use-cases/production) before exposing the runtime to real users.
