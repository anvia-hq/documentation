# Get started

Install React UI with its controller package and React peers.

```sh
pnpm add @anvia/react-ui @anvia/react @anvia/client react react-dom
```

Choose one of two styling paths:

```sh
# Install editable application components
pnpm dlx @anvia/cli add chat
```

Or compose the headless primitives directly and pass your own `className` values:

Compose a controller and component families:

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import { ChatProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from '@anvia/react-ui'

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

Providers accept existing `useChat` or `useCompletion` results. The UI package does not create a
transport, own server state, run an agent, or ship CSS. Its semantic DOM contract uses ARIA,
`data-state`, and `data-role` only.

Import from the root for convenience or from subpaths such as `@anvia/react-ui/message` and `@anvia/react-ui/chat` for clearer boundaries. Continue with [components and theming](/packages/react-ui/components-and-theming) or the [API reference](/packages/react-ui/api-reference).
