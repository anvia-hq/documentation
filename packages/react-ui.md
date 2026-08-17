# `@anvia/react-ui`

`@anvia/react-ui` is a set of composable React primitives for chat, completion, messages, attachments, human input, images, thread lists, and streaming Markdown. It connects to controllers from `@anvia/react` while leaving layout and product styling in the application.

Use the root package for a convenient combined API or import a component family such as `@anvia/react-ui/message` when you want a narrower boundary.

## Install

```sh
pnpm add @anvia/react-ui @anvia/react @anvia/client react react-dom
```

Import the optional base stylesheet once:

```ts
import '@anvia/react-ui/styles.css'
```

You can omit it and style the stable `data-anvia-*` attributes or the classes passed to individual primitives.

## Compose a chat interface

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import {
  ChatProvider,
  Composer,
  Message,
  Thread,
} from '@anvia/react-ui'
import '@anvia/react-ui/styles.css'

export function SupportChat() {
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
              <Message.Actions />
            </Message.Root>
          </Thread.Messages>
          <Thread.Error />
          <Thread.ScrollToBottom>Jump to latest</Thread.ScrollToBottom>
        </Thread.Viewport>

        <Composer.Root>
          <Composer.Attachments />
          <Composer.AddAttachment>Attach</Composer.AddAttachment>
          <Composer.Input placeholder="Send a message..." />
          <Composer.Stop>Stop</Composer.Stop>
          <Composer.Submit>Send</Composer.Submit>
        </Composer.Root>
      </Thread.Root>
    </ChatProvider>
  )
}
```

Compound components read their controller and item state from context, so the same primitives can be rearranged without duplicating transport logic.

## Component families

| Entry point | Public family | Purpose |
| --- | --- | --- |
| `@anvia/react-ui/chat` | `Composer`, `Thread` | Chat layout, rich composer, suggestions, and scrolling |
| `@anvia/react-ui/message` | `Message` | Message parts, Markdown, tools, reasoning, entities, and actions |
| `@anvia/react-ui/completion` | `Completion` | Prompt form and completion output |
| `@anvia/react-ui/human-input` | `HumanInput` | Tool approvals and structured questions |
| `@anvia/react-ui/attachment` | `Attachment` | Attachment name, preview, and removal |
| `@anvia/react-ui/image` | `Image` | Preview, copy, download, and zoom overlay |
| `@anvia/react-ui/thread-list` | `ThreadList`, `ThreadListItem` | Conversation navigation and management actions |
| `@anvia/react-ui/selection-toolbar` | `SelectionToolbar` | Quote and copy actions for selected text |
| `@anvia/react-ui/stream` | `StreamMarkdown` | Context-free Markdown rendering for app-owned streamed text |

## Common patterns

### Use compound parts as the stable customization boundary

Components such as `Message`, `Composer`, and `HumanInput` are objects containing individually renderable parts. Add product-specific layout around those parts instead of forking the controller logic.

### Integrate a design system with `asChild`

Interactive and structural primitives accept regular element props, and many accept `asChild` through the shared primitive types. This lets a design-system component become the rendered element while retaining Anvia behavior and accessibility wiring.

### Keep controller ownership in `@anvia/react`

`ChatProvider` and `CompletionProvider` receive hook results; they do not create network requests themselves. This separation makes controllers testable and keeps custom transports available.

### Import stream styles separately

When using `StreamMarkdown`, import `@anvia/react-ui/stream/styles.css` for its settle animation. The root stylesheet and stream stylesheet are separate public CSS entry points.

### Render only trusted custom components

Markdown output and tool results may contain model-produced content. Treat custom links, downloads, entity actions, and tool renderers as application security boundaries.

## Runtime compatibility

| Field | Value |
| --- | --- |
| Package format | ESM |
| React peer dependency | `>=18` |
| React DOM peer dependency | `>=18` |
| `@anvia/react` peer dependency | Matching `1.0.0-rc.x` release candidate |
| Styling | Optional public CSS entry points |

The components target React DOM and use browser behavior for rich composer, selection, image, and attachment interactions. Render browser-dependent interactions on the client when using an SSR framework.

## Continue learning

- [Messages and content](/sdk/messages/content)
- [Tool calls](/sdk/messages/tools)
- [Streaming event types](/sdk/streaming/event-types)
- [Approvals and questions in Studio](/studio/playground/approvals-and-questions)

For exact exports, compound parts, and controller types, use the [API reference](/packages/react-ui/api-reference). For release history, read the [source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/react-ui/CHANGELOG.md).
