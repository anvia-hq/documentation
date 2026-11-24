# Get started

Install React UI with its controller package and React peers.

```sh
pnpm add @anvia/react-ui @anvia/react @anvia/client react react-dom
```

Choose one of two styling paths. For editable application components, follow the
[CLI component guide](/packages/cli/components), which installs them with `anvia ui add chat`.

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

## Optional sandbox viewers

The terminal and desktop viewers are separate entry points with optional peer dependencies. Install
only the peers for the viewer you use:

```sh
# @anvia/react-ui/sandbox-terminal
pnpm add @xterm/xterm @xterm/addon-fit

# @anvia/react-ui/sandbox-desktop
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

Import from the root for convenience or from subpaths such as `@anvia/react-ui/message` and `@anvia/react-ui/chat` for clearer boundaries. Continue with [components and theming](/packages/react-ui/components-and-theming) or the [API reference](/packages/react-ui/api-reference).
