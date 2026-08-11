# `@anvia/react`

`@anvia/react` provides client-side hooks and transports for Anvia chat and completion interfaces. It owns local `UIMessage[]` state, consumes JSONL or SSE event streams, exposes cancellation and resume controls, and models human approval or question flows without prescribing visual components.

Use it when a React application needs state and transport behavior. Pair it with your own components or with `@anvia/react-ui`.

## Install

```sh
pnpm add @anvia/react @anvia/core react
```

## Build a chat client

```tsx
import { useChat } from '@anvia/react'
import { useState } from 'react'

export function SupportChat() {
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
        <article key={message.id}>
          {message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')}
        </article>
      ))}

      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <button disabled={chat.status === 'streaming'}>Send</button>
      {chat.status === 'streaming' && (
        <button type="button" onClick={chat.stop}>Stop</button>
      )}
    </form>
  )
}
```

The default request body is `UIStreamRequest`: Core messages, `stream: true`, optional metadata, and an optional resume cursor. The hook keeps richer UI message state locally and converts it before sending.

## Key features

| API | Purpose |
| --- | --- |
| `useChat` | Multi-message chat state, streaming events, regenerate, stop, resume, suggestions, and human input |
| `useCompletion` | Prompt-and-result state for completion interfaces |
| `createFetchTransport` | Configurable fetch-backed `EventTransport` for JSONL or SSE |
| `createDirectTransport` | In-process transport for custom runtimes and tests |
| `fetchEventStream` | Low-level streamed fetch helper |
| `useSmoothStreamText` | Display-only pacing for append-only text |
| `useSmoothStreamItems` | Display-only pacing for mixed text and tool items |
| `initialMessagesFromMemory` | Convert persisted Core messages into initial UI messages |

## Common patterns

### Own transport separately from rendering

The `EventTransport<TRequest, TEvent>` contract has one `send` method. Inject a custom transport when authentication, routing, desktop IPC, tests, or a non-HTTP environment requires it.

### Adapt custom events explicitly

Use `eventToUIEvent`, `eventToDelta`, or `eventToFinal` when the server does not emit the standard `UIStreamEvent` format. `onEvent` observes events; it does not replace the state adapter.

### Keep smoothing display-only

Smoothing hooks never mutate the source stream or stored messages. Keep them mounted after streaming stops so buffered content can drain, and change `resetKey` when the active message or conversation changes.

### Pair resume with a resumable server route

`useChat({ resume: { key } })` persists a cursor in browser storage. The server must return resumable envelopes using `@anvia/server`; enabling the client option alone cannot make a stream resumable. See [Resumable streams](/sdk/streaming/resumable-streams).

### Treat approvals as application decisions

The hook can track approvals and questions and call default endpoints. The server still owns authorization, expiration, audit behavior, and whether a pending action may be resolved by the current user.

## Runtime compatibility

| Field | Value |
| --- | --- |
| Package format | ESM |
| React peer dependency | `>=18` |
| Anvia dependency | `@anvia/core` |
| Browser APIs used by defaults | Fetch, Web Streams, `AbortController`, optional Web Storage |

Custom transports can remove the browser-fetch assumption. Resume storage is accessed only when resume is configured; server rendering should not rely on browser storage during render.

## Continue learning

- [Messages](/sdk/messages)
- [Streaming](/sdk/streaming)
- [Server transport](/sdk/streaming/server-transport)
- [Resumable streams](/sdk/streaming/resumable-streams)
- [Approvals in Studio](/studio/playground/approvals-and-questions)

For exact exports and signatures, use the [API reference](/packages/react/api-reference). For release history, read the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/react/CHANGELOG.md).
