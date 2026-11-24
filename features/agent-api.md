# Agent API and interfaces

Serve an agent from your own HTTP route and render it in React. Anvia applications keep provider credentials and agent execution on the server, then send normalized runtime events to the client. The client owns interaction state; the server remains the trusted runtime boundary.

## 1. Install the application packages

Anvia packages release independently. Install current stable versions whose declared dependency and
peer-dependency ranges are compatible:

```bash
pnpm add @anvia/core @anvia/client @anvia/openai @anvia/server @anvia/react
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
    modelId: 'gpt-5.6-sol',
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
  if (body.type !== 'messages') {
    return new Response('Interaction responses are not enabled', { status: 400 })
  }

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

`parseClientStreamRequest()` validates the request body and returns one of two request kinds:

```ts
type ClientStreamRequest = {
  type: 'messages'
  messages: readonly Message[]
  metadata?: JsonObject
  resume?: { streamId: string; after: number }
} | {
  type: 'interaction_response'
  interactionId: string
  response: AgentInteractionResponse
  metadata?: JsonObject
  resume?: { streamId: string; after: number }
}
```

Branch on `body.type` at the server boundary rather than assuming a single `{ message }` string.
An `interaction_response` answers an approval or question from an earlier run; reject it, as the
route above does, until your server stores and resumes interaction continuations. Use `metadata`
only for non-sensitive request context, and validate any values before trusting them.

## Next

Add narrow application actions with [Tools](/sdk/tools), then review [Security and auth](/features/security) before exposing the runtime to real users.
