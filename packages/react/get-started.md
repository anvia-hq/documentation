# Get started

```sh
pnpm add @anvia/client @anvia/react react
```

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import { useState } from 'react'

const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })

export function Chat() {
  const chat = useChat({ transport })
  const [input, setInput] = useState('')

  return (
    <form onSubmit={(event) => {
      event.preventDefault()
      void chat.sendMessage({ text: input })
      setInput('')
    }}>
      {chat.messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part) => part.type === 'text' ? part.text : null)}
        </div>
      ))}
      <input value={input} onChange={(event) => setInput(event.target.value)} />
      <button disabled={chat.status === 'submitted' || chat.status === 'streaming'}>Send</button>
      <button type="button" onClick={chat.stop}>Stop</button>
    </form>
  )
}
```

The server route must return `createClientStreamResponse({ events })` with client events produced by `agentToClientStream()` or `completionToClientStream()`.

Use `useCompletion` for a prompt/output interface. For composable visual primitives, add [`@anvia/react-ui`](/packages/react-ui/get-started).
