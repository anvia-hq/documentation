# `@anvia/react`

`@anvia/react` provides client-side state hooks for Anvia chat and completion interfaces. Framework-neutral messages, protocol events, and transports live in `@anvia/client`; visual components live in `@anvia/react-ui`.

## Install

```sh
pnpm add @anvia/client @anvia/react react
```

## Build a chat client

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import { useState } from 'react'

const transport = createHttpClientTransport({
  endpoint: '/api/chat',
  format: 'jsonl',
})

export function SupportChat() {
  const chat = useChat({ transport })
  const [input, setInput] = useState('')

  return (
    <form onSubmit={(event) => {
      event.preventDefault()
      void chat.sendMessage({ text: input })
      setInput('')
    }}>
      {chat.messages.map((message) => (
        <article key={message.id}>
          {message.parts.map((part) => part.type === 'text' ? part.text : '').join('')}
        </article>
      ))}
      <input value={input} onChange={(event) => setInput(event.target.value)} />
      <button disabled={chat.status === 'submitted' || chat.status === 'streaming'}>Send</button>
      {chat.status === 'streaming' && <button type="button" onClick={chat.stop}>Stop</button>}
    </form>
  )
}
```

The hook converts local `UIMessage` values into core messages, sends a `ClientStreamRequest`, validates framed client events, and reduces those events back into UI state.

## Key features

- `useChat`: messages, events, send/regenerate/stop/reset, suggestions, usage, resume, approvals, and questions.
- `useCompletion`: prompt and accumulated completion state over a required client transport.
- `useSmoothStreamText` and `useSmoothStreamItems`: display-only pacing for streamed text.
- `createHttpClientTransport` and `createDirectClientTransport` from `@anvia/client`: HTTP and in-process protocol boundaries.

`useChat({ resume: { key } })` stores a cursor and transcript cache in browser storage. The server must implement matching resumable client responses; the client option alone does not make a run durable.

The hooks do not render Markdown, authenticate routes, authorize tool decisions, persist server conversations, or create resumable storage. Pair them with an authenticated `@anvia/server` route.

Continue with [Get started](/packages/react/get-started), [state and streaming](/packages/react/state-and-streaming), or the [API reference](/packages/react/api-reference).
