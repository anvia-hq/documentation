# Build applications

Anvia keeps provider credentials and agent execution on the server while sending normalized runtime events to product clients.

## Expose an agent stream

Install the server integration:

```bash
pnpm add @anvia/server
```

```ts
import type { UIStreamRequest } from '@anvia/core'
import { createEventStream } from '@anvia/server'

export async function POST(request: Request) {
  const body = (await request.json()) as UIStreamRequest

  return createEventStream(agent.prompt(body.messages).stream(), {
    format: 'jsonl',
  })
}
```

JSONL is the default and works with Anvia React transports. Use `{ format: 'sse' }` when an existing client requires server-sent events.

The default React request shape is:

```ts
type UIStreamRequest = {
  messages: Message[]
  stream: true
  metadata?: JsonValue
}
```

Read `body.messages` at the server boundary rather than assuming a single `{ message }` string.

## Consume the stream in React

```bash
pnpm add @anvia/react
```

```tsx
import { useChat } from '@anvia/react'
import { useState } from 'react'

export function Chat() {
  const chat = useChat({ endpoint: '/api/chat' })
  const [input, setInput] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void chat.sendMessage(input)
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

      <input value={input} onChange={(event) => setInput(event.target.value)} />
      <button type="submit">Send</button>
    </form>
  )
}
```

`useChat` converts local UI messages to core messages, sends them to the endpoint, reads JSONL by default, and updates state from runtime events.

## Add product actions

Register narrow, schema-validated tools for private data and actions. Authenticate the request and enforce authorization inside the application boundary before a tool reads or changes data.
