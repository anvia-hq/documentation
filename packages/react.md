# `@anvia/react`

`@anvia/react` provides client-side state hooks for Anvia chat and completion interfaces. Framework-neutral messages, protocol events, and transports live in `@anvia/client`; visual components live in `@anvia/react-ui`.

## Install

```sh
pnpm add @anvia/client @anvia/core @anvia/react react
```

`@anvia/client`, `@anvia/core`, and React `>=18` are required peer dependencies. `@anvia/graph` is an optional peer consumed by the `@anvia/react/graph-explorer` entry point.

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

For a durable backend, create a transport from `@anvia/client/durable-chat` instead:

```ts
import { DurableClient } from '@anvia/client/durable'
import { createDurableChatTransport } from '@anvia/client/durable-chat'
import { useChat } from '@anvia/react'

const client = new DurableClient({ endpoint: '/durable' })
const transport = createDurableChatTransport({
  client,
  agentId: 'researcher',
  sessionId: 'chat-42',
})
const chat = useChat({ transport })
```

The adapter maps durable journal events to the same v3 frames, routes interaction responses to the active run, and uses a durable run ID plus sequence as its resume cursor. `chat.stop()` only detaches the subscription; use `transport.controller.cancel()` to cancel the run. See [Durable chat transport](/packages/client/durable-chat) for the event mapping, controller, busy-session handling, and known limitations.

## Key features

- `useChat`: messages, events, send/regenerate/stop/reset, suggestions, usage, stream resume, and pending agent interactions.
- `useCompletion`: prompt and accumulated completion state over a required client transport.
- `useGraphExplorer` from `@anvia/react/graph-explorer`: graph exploration state over an application-provided `explore` callback, including nodes, relationships, selection, query matching, expansion, and refresh.
- `useSmoothStreamText` and `useSmoothStreamItems`: display-only pacing for streamed text.
- `createHttpClientTransport` and `createDirectClientTransport` from `@anvia/client`: HTTP and in-process protocol boundaries.

`useChat({ resume: { key } })` stores a version 3 cursor, transcript, interaction state, and last request in browser storage. The server must implement matching resumable client responses; the client option alone does not make a run durable.

Use `chat.interactions.pending` to render approvals or structured questions, then call `chat.respondToInteraction({ interactionId, response })`. An interaction response is a new client-protocol request and starts a linked agent phase on the server.

The hooks do not render Markdown, authenticate routes, authorize tool decisions, persist server conversations, or create resumable storage. Pair them with an authenticated `@anvia/server` route.

Continue with [Get started](/packages/react/get-started), [state and streaming](/packages/react/state-and-streaming), or the [API reference](/packages/react/api-reference).
