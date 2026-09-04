# Capabilities

React UI exposes compound component families backed by context from `@anvia/react` controllers.

| Family | Public namespace | Responsibility |
| --- | --- | --- |
| Chat | `ThreadPrimitive` | Viewport, messages, empty/loading/error states, suggestions, scrolling |
| Composer | `ComposerPrimitive` | Rich or textarea input, attachments, drops, quotes, trigger entities, submit/stop |
| Messages | `MessagePrimitive` | Text, Markdown, reasoning, tools, data, attachments, errors, actions |
| Completion | `CompletionPrimitive` | Prompt form, input, output, submit, and stop |
| Human input | `HumanInputPrimitive` | Pending interaction collections and approval/question response actions |
| Attachments | `AttachmentPrimitive` | Name, preview, and removal |
| Images | `ImagePrimitive` | Preview, copy, download, and zoom overlay |
| Selection | `SelectionToolbarPrimitive` | Quote and copy actions for message selections |
| Threads | `ThreadListPrimitive`, `ThreadListItemPrimitive` | App-controlled thread navigation and archive/delete actions |
| Context usage | `ContextMeterPrimitive` | Used or remaining model-context display |
| Streamed Markdown | `StreamMarkdown` | Context-free rendering for an app-owned growing string |
| Graph explorer | `GraphExplorerPrimitive`, `GraphExplorerNodePrimitive` | Provider context, search, node list, status and empty states, refresh, and node expansion over a `useGraphExplorer` controller |

## Headless behavior

Most parts forward native element props and refs. Many support `asChild`, letting a design-system
element become the rendered node while Anvia preserves behavior and semantic attributes. Collection
parts establish item contexts consumed by hooks such as `useMessagePart`, `useApproval`, and
`useThreadListItem`. There is no package stylesheet; use `className`, `asChild`, or editable
components installed by `@anvia/cli`.

## Boundaries

The package does not provide a complete visual theme, application navigation, server persistence, authentication, Markdown link policy, or tool authorization. Thread-list mutations call the controller supplied by the application. Human-input buttons call `useChat().respondToInteraction()` and do not decide whether the current user is allowed to resolve an interaction.

The rich composer uses Tiptap and browser DOM behavior. Image zoom, selection tooling, attachments, and rich editing should run on the client in SSR applications.

See [components and theming](/packages/react-ui/components-and-theming) and the [API reference](/packages/react-ui/api-reference).
