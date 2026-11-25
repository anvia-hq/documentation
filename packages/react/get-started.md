# Get started

Install the package with its controller and transport peers:

```sh
pnpm add @anvia/client @anvia/core @anvia/react react react-dom
```

## Chat hook

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

Use `useCompletion` for a prompt/output interface.

## Headless primitives

Choose one of two styling paths. For editable application components, follow the
[CLI component guide](/packages/cli/components), which installs them with `anvia ui add chat`.

Or compose the headless primitives directly and pass your own `className` values:

```tsx
import { createHttpClientTransport } from '@anvia/client'
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useChat,
} from '@anvia/react'

export function Chat() {
  const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })
  const chat = useChat({ transport })

  return (
    <ChatProvider controller={chat}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          <ThreadPrimitive.Empty>Start a conversation.</ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages>
            <MessagePrimitive.Root>
              <MessagePrimitive.Content>
                <MessagePrimitive.Parts />
              </MessagePrimitive.Content>
            </MessagePrimitive.Root>
          </ThreadPrimitive.Messages>
          <ThreadPrimitive.Error />
        </ThreadPrimitive.Viewport>

        <ComposerPrimitive.Root>
          <ComposerPrimitive.Attachments />
          <ComposerPrimitive.Input placeholder="Send a message..." />
          <ComposerPrimitive.Stop>Stop</ComposerPrimitive.Stop>
          <ComposerPrimitive.Submit>Send</ComposerPrimitive.Submit>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </ChatProvider>
  )
}
```

Providers accept existing `useChat` or `useCompletion` results. The primitives do not create a
transport, own server state, run an agent, or ship CSS. Their semantic DOM contract uses ARIA,
`data-state`, and `data-role` only.

## Optional sandbox viewers

The terminal and desktop viewers are separate entry points with optional peer dependencies. Install
only the peers for the viewer you use:

```sh
# @anvia/react/sandbox-terminal
pnpm add @xterm/xterm @xterm/addon-fit

# @anvia/react/sandbox-desktop
pnpm add @novnc/novnc
```

Import xterm's stylesheet once in the application:

```ts
import '@xterm/xterm/css/xterm.css'
```

Both components stay off the root export, and their viewer libraries load on demand when a viewer
mounts. The application supplies a one-time ticket for each connection; the sandbox hub authorizes
the session and any read-only grant. See [terminal behavior and security](/sdk/advanced/sandbox/terminals)
and [desktop behavior and control](/sdk/advanced/sandbox/desktop).

Continue with [components and theming](/packages/react/components-and-theming), the
[primitives API reference](/packages/react/primitives-api-reference), or the
[hook API reference](/packages/react/api-reference).
