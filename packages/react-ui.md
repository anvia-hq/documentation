# `@anvia/react-ui`

`@anvia/react-ui` is a strictly headless behavior layer for chat, completion, messages,
attachments, human input, images, thread lists, and streaming Markdown. It connects to controllers
from `@anvia/react` while leaving all layout and product styling in the application.

Use the root package for a convenient combined API or import a component family such as `@anvia/react-ui/message` when you want a narrower boundary.

## Install

```sh
pnpm add @anvia/react-ui @anvia/react @anvia/client react react-dom
```

For editable Tailwind and shadcn-based application components, install the complete chat registry:

```sh
pnpm dlx @anvia/cli add chat
```

The primitive package has no stylesheet. Style ordinary `className` props or compose design-system
elements with `asChild`. Its small DOM contract is limited to ARIA attributes, `data-state`, and
`data-role`.

## Compose a chat interface

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@anvia/react-ui'

export function SupportChat() {
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
              <MessagePrimitive.Actions />
            </MessagePrimitive.Root>
          </ThreadPrimitive.Messages>
          <ThreadPrimitive.Error />
          <ThreadPrimitive.ScrollToBottom>Jump to latest</ThreadPrimitive.ScrollToBottom>
        </ThreadPrimitive.Viewport>

        <ComposerPrimitive.Root>
          <ComposerPrimitive.Attachments />
          <ComposerPrimitive.AddAttachment>Attach</ComposerPrimitive.AddAttachment>
          <ComposerPrimitive.Input placeholder="Send a message..." />
          <ComposerPrimitive.Stop>Stop</ComposerPrimitive.Stop>
          <ComposerPrimitive.Submit>Send</ComposerPrimitive.Submit>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </ChatProvider>
  )
}
```

Compound components read their controller and item state from context, so the same primitives can be rearranged without duplicating transport logic.

## Component families

| Entry point | Public family | Purpose |
| --- | --- | --- |
| `@anvia/react-ui/chat` | `ComposerPrimitive`, `ThreadPrimitive` | Chat layout, rich composer, suggestions, and scrolling |
| `@anvia/react-ui/message` | `MessagePrimitive` | Message parts, Markdown, tools, reasoning, entities, and actions |
| `@anvia/react-ui/completion` | `CompletionPrimitive` | Prompt form and completion output |
| `@anvia/react-ui/human-input` | `HumanInputPrimitive` | Pending tool-approval and structured-question interactions |
| `@anvia/react-ui/attachment` | `AttachmentPrimitive` | Attachment name, preview, and removal |
| `@anvia/react-ui/image` | `ImagePrimitive` | Preview, copy, download, and zoom overlay |
| `@anvia/react-ui/thread-list` | `ThreadListPrimitive`, `ThreadListItemPrimitive` | Conversation navigation and management actions |
| `@anvia/react-ui/selection-toolbar` | `SelectionToolbarPrimitive` | Quote and copy actions for selected text |
| `@anvia/react-ui/stream` | `StreamMarkdown` | Context-free Markdown rendering for app-owned streamed text |
| `@anvia/react-ui/graph-explorer` | `GraphExplorerPrimitive`, `GraphExplorerNodePrimitive` | Headless graph-explore provider, search, viewport, node list, empty/status parts, refresh, and node expansion |
| `@anvia/react-ui` | `ContextMeterPrimitive` | Used or remaining model-context display |

## Common patterns

### Use compound parts as the stable customization boundary

Components such as `MessagePrimitive`, `ComposerPrimitive`, and `HumanInputPrimitive` are objects containing individually renderable parts. Add product-specific layout around those parts instead of forking the controller logic.

### Integrate a design system with `asChild`

Interactive and structural primitives accept regular element props, and many accept `asChild` through the shared primitive types. This lets a design-system component become the rendered element while retaining Anvia behavior and accessibility wiring.

### Keep controller ownership in `@anvia/react`

`ChatProvider` and `CompletionProvider` receive hook results; they do not create network requests themselves. This separation makes controllers testable and keeps custom transports available.

### Own stream reveal styling

`StreamMarkdown` marks its growing tail with `data-state="revealing"`, but the package does not
animate it. Add an application animation directly or install the `markdown`, `message`, `thread`, or
`chat` registry item from `@anvia/cli`.

### Render only trusted custom components

Markdown output and tool results may contain model-produced content. Treat custom links, downloads, entity actions, and tool renderers as application security boundaries.

## Runtime compatibility

| Field | Value |
| --- | --- |
| Package format | ESM |
| React peer dependency | `>=18` |
| React DOM peer dependency | `>=18` |
| `@anvia/react` peer dependency | Matching stable release |
| Styling | Application-owned; no package CSS exports |

The components target React DOM and use browser behavior for rich composer, selection, image, and attachment interactions. Render browser-dependent interactions on the client when using an SSR framework.

## Continue learning

- [Messages and content](/sdk/messages/content)
- [Tool calls](/sdk/messages/tools)
- [Streaming event types](/sdk/streaming/event-types)
- [Interactions and continuations](/sdk/agents/interactions)
- [Approvals and questions in Studio](/studio/playground/approvals-and-questions)

For exact exports, compound parts, and controller types, use the [API reference](/packages/react-ui/api-reference). For release history, read the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/react-ui/CHANGELOG.md).
