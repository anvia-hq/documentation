# Capabilities

React UI exposes compound component families backed by context from `@anvia/react` controllers.

| Family | Public namespace | Responsibility |
| --- | --- | --- |
| Chat | `Thread` | Viewport, messages, empty/loading/error states, suggestions, scrolling |
| Composer | `Composer` | Rich or textarea input, attachments, drops, quotes, trigger entities, submit/stop |
| Messages | `Message` | Text, Markdown, reasoning, tools, data, attachments, errors, actions |
| Completion | `Completion` | Prompt form, input, output, submit, and stop |
| Human input | `HumanInput` | Pending interaction collections and approval/question response actions |
| Attachments | `Attachment` | Name, preview, and removal |
| Images | `Image` | Preview, copy, download, and zoom overlay |
| Selection | `SelectionToolbar` | Quote and copy actions for message selections |
| Threads | `ThreadList`, `ThreadListItem` | App-controlled thread navigation and archive/delete actions |
| Context usage | `ContextMeter` | Used or remaining model-context display |
| Streamed Markdown | `StreamMarkdown` | Context-free rendering for an app-owned growing string |

## Headless behavior

Most parts forward native element props and refs. Many support `asChild`, letting a design-system element become the rendered node while Anvia preserves behavior and data attributes. Collection parts establish item contexts consumed by hooks such as `useMessagePart`, `useApproval`, and `useThreadListItem`.

## Boundaries

The package does not provide a complete visual theme, application navigation, server persistence, authentication, Markdown link policy, or tool authorization. Thread-list mutations call the controller supplied by the application. Human-input buttons call `useChat().respondToInteraction()` and do not decide whether the current user is allowed to resolve an interaction.

The rich composer uses Tiptap and browser DOM behavior. Image zoom, selection tooling, attachments, and rich editing should run on the client in SSR applications.

See [components and theming](/packages/react-ui/components-and-theming) and the [API reference](/packages/react-ui/api-reference).
