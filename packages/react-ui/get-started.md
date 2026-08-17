# Get started

Install React UI with its controller package and React peers.

```sh
pnpm add @anvia/react-ui @anvia/react @anvia/client react react-dom
```

Import the optional structural stylesheet once:

```ts
import '@anvia/react-ui/styles.css'
```

Compose a controller and component families:

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import { ChatProvider, Composer, Message, Thread } from '@anvia/react-ui'
import '@anvia/react-ui/styles.css'

export function Chat() {
  const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })
  const chat = useChat({ transport })

  return (
    <ChatProvider controller={chat}>
      <Thread.Root>
        <Thread.Viewport>
          <Thread.Empty>Start a conversation.</Thread.Empty>
          <Thread.Messages>
            <Message.Root>
              <Message.Content>
                <Message.Parts />
              </Message.Content>
            </Message.Root>
          </Thread.Messages>
          <Thread.Error />
        </Thread.Viewport>

        <Composer.Root>
          <Composer.Attachments />
          <Composer.Input placeholder="Send a message..." />
          <Composer.Stop>Stop</Composer.Stop>
          <Composer.Submit>Send</Composer.Submit>
        </Composer.Root>
      </Thread.Root>
    </ChatProvider>
  )
}
```

Providers accept existing `useChat` or `useCompletion` results. The UI package does not create a transport, own server state, or run an agent.

Import from the root for convenience or from subpaths such as `@anvia/react-ui/message` and `@anvia/react-ui/chat` for clearer boundaries. Continue with [components and theming](/packages/react-ui/components-and-theming) or the [API reference](/packages/react-ui/api-reference).
