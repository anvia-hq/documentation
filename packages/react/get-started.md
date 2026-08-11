# Get started

Install the state and transport package in a React application. It does not include visual components.

```sh
pnpm add @anvia/react @anvia/core react
```

Create a server route that emits JSONL or SSE events, then point `useChat` at it:

```tsx
import { useChat } from '@anvia/react'
import { useState } from 'react'

export function Chat() {
  const chat = useChat({ endpoint: '/api/chat' })
  const [input, setInput] = useState('')

  return (
    <form onSubmit={(event) => {
      event.preventDefault()
      void chat.sendMessage(input)
      setInput('')
    }}>
      {chat.messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part) =>
            part.type === 'text' ? part.text : null,
          )}
        </div>
      ))}

      <input value={input} onChange={(event) => setInput(event.target.value)} />
      <button disabled={chat.status === 'streaming'}>Send</button>
      <button type="button" onClick={chat.stop}>Stop</button>
    </form>
  )
}
```

With `endpoint`, the hook creates a fetch transport using JSONL by default. Local `UIMessage[]` values are converted into Core `Message[]` before the request is built.

Use `useCompletion` for a prompt/output interface without chat-specific actions. Use a custom `EventTransport` when HTTP fetch is not the right boundary.

For ready-made composable views, add [`@anvia/react-ui`](/packages/react-ui/get-started). For the server route, see [`@anvia/server`](/packages/server/get-started).
