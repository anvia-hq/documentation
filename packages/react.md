# `@anvia/react`

`@anvia/react` provides client-side state hooks and strictly headless UI primitives for Anvia chat
and completion interfaces. Framework-neutral messages, protocol events, and transports live in
`@anvia/client`.

The hooks (`useChat`, `useCompletion`, `useDurableChat`, `useGraphExplorer`, and stream smoothing)
own React state. The primitives (`ChatProvider`, `ThreadPrimitive`, `ComposerPrimitive`,
`MessagePrimitive`, and the other component families) render accessible markup with no stylesheet,
so layout and product styling stay in the application.

## Install

```sh
pnpm add @anvia/client @anvia/core @anvia/react react react-dom
```

`@anvia/client`, `@anvia/core`, and React `>=18` are required peer dependencies. `@anvia/graph` is an optional peer consumed by the `@anvia/react/graph-explorer` entry point. The sandbox viewers add optional `@xterm/xterm` with `@xterm/addon-fit` or `@novnc/novnc` peers on their own subpaths.

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

## Compose headless primitives

The same `useChat` result drives the primitive families through a provider:

```tsx
import { createHttpClientTransport } from '@anvia/client'
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useChat,
} from '@anvia/react'

const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })

export function SupportChat() {
  const chat = useChat({ transport })

  return (
    <ChatProvider controller={chat}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          <ThreadPrimitive.Messages>
            <MessagePrimitive.Root>
              <MessagePrimitive.Content>
                <MessagePrimitive.Parts />
              </MessagePrimitive.Content>
            </MessagePrimitive.Root>
          </ThreadPrimitive.Messages>
        </ThreadPrimitive.Viewport>

        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input placeholder="Send a message..." />
          <ComposerPrimitive.Stop>Stop</ComposerPrimitive.Stop>
          <ComposerPrimitive.Submit>Send</ComposerPrimitive.Submit>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </ChatProvider>
  )
}
```

Providers accept an existing `useChat` or `useCompletion` result. The primitives do not create a transport, own server state, run an agent, or ship CSS. Their semantic DOM contract uses ARIA, `data-state`, and `data-role` only.

Import from the root for convenience or from a subpath such as `@anvia/react/chat` and `@anvia/react/message` for a narrower boundary. See [components and theming](/packages/react/components-and-theming) and the [primitives API reference](/packages/react/primitives-api-reference).

## Durable chat

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

- `useChat`: messages, events, send/regenerate/stop/reset, suggestions, usage, context breakdown, stream resume, and pending agent interactions.
- `useDurableChat`: `useChat` over a durable transport, plus the durable run ID, status, and steering, cancel, retry, and reconciliation controls. See [Durable chat hook](/packages/react/durable-chat).
- `useCompletion`: prompt and accumulated completion state over a required client transport.
- `useGraphExplorer` from `@anvia/react/graph-explorer`: graph exploration state over an application-provided `explore` callback, including nodes, relationships, selection, query matching, expansion, and refresh.
- `useSmoothStreamText` and `useSmoothStreamItems`: display-only pacing for streamed text.
- Headless primitives: chat, composer, messages, completion, human input, attachments, images, selection toolbar, thread lists, context meter, streamed Markdown, graph explorer, and optional sandbox terminal and desktop viewers.
- `createHttpClientTransport` and `createDirectClientTransport` from `@anvia/client`: HTTP and in-process protocol boundaries.

`useChat({ resume: { key } })` stores a version 3 cursor, transcript, interaction state, and last request in browser storage. The server must implement matching resumable client responses; the client option alone does not make a run durable.

Use `chat.interactions.pending` to render approvals or structured questions, then call `chat.respondToInteraction({ interactionId, response })`. An interaction response is a new client-protocol request and starts a linked agent phase on the server.

The package does not authenticate routes, authorize tool decisions, persist server conversations, create resumable storage, or provide a visual theme.

## Migrating from `@anvia/react-ui`

The separate React UI package is gone; its primitives were merged into `@anvia/react` in
`@anvia/react` 1.3.0. The old root import path becomes `@anvia/react` and each old subpath becomes
the same subpath of `@anvia/react`, so `chat`, `message`, and `sandbox-terminal` keep their names.

```ts
import { ChatProvider, ComposerPrimitive } from '@anvia/react'
import { SandboxTerminal } from '@anvia/react/sandbox-terminal'
```

No component API changed, so renaming imports and removing the old dependency is the whole
migration. `@anvia/cli` registry items now
declare `@anvia/react`, and `@anvia/studio` imports the primitives from the same package.

Continue with [Get started](/packages/react/get-started), [state and streaming](/packages/react/state-and-streaming), or the [API reference](/packages/react/api-reference).
