# Capabilities

`@anvia/react` owns React state and headless markup, not transport implementation, rendering policy, or server execution.

## Controllers and hooks

- Chat: `useChat` manages UI messages, protocol events, send/regenerate/stop/reset, suggestions, context usage and breakdown, stream resume, and interaction responses.
- Completion: `useCompletion` manages input, completion text, events, usage, submit/stop/reset.
- Graph exploration: `useGraphExplorer` from the `@anvia/react/graph-explorer` entry point manages overview, expansion, and refresh requests over an application-provided `explore` callback, with result merging, selection, and client-side query matching.
- Smoothing: `useSmoothStreamText` and `useSmoothStreamItems` pace display without mutating stored state.
- Transport: supply a `ClientTransport` from `@anvia/client`, normally `createHttpClientTransport()`.
- Resume: the hook stores v3 cursor, message, interaction, and request state; `@anvia/server` and durable storage own replay.

The request union is `{ type: 'messages', messages, metadata?, resume? }` or `{ type: 'interaction_response', interactionId, response, metadata?, resume? }`. Hooks consume the versioned client frame/event protocol, not raw agent or completion events.

React `>=18` is the declared peer dependency. HTTP transport requires Fetch and Web Streams; resume requires browser storage or a supplied `Storage` implementation.

## Headless primitives

The primitives expose compound component families backed by context from the controllers.

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
| Sandbox terminal (`@anvia/react/sandbox-terminal`) | `SandboxTerminal` | xterm.js terminal for a remote sandbox session, with connection status, reconnect, and read-only display |
| Sandbox desktop (`@anvia/react/sandbox-desktop`) | `SandboxDesktop` | noVNC desktop viewer with scaling, quality controls, and agent/viewer control handoff |
| Graph explorer | `GraphExplorerPrimitive`, `GraphExplorerNodePrimitive` | Provider context, search, node list, status and empty states, refresh, and node expansion over a `useGraphExplorer` controller |

Most parts forward native element props and refs. Many support `asChild`, letting a design-system
element become the rendered node while Anvia preserves behavior and semantic attributes. Collection
parts establish item contexts consumed by hooks such as `useMessagePart`, `useApproval`, and
`useThreadListItem`. There is no package stylesheet; use `className`, `asChild`, or editable
components installed by `@anvia/cli`.

The package does not provide a complete visual theme, application navigation, server persistence, authentication, Markdown link policy, or tool authorization. Thread-list mutations call the controller supplied by the application. Human-input buttons call `useChat().respondToInteraction()` and do not decide whether the current user is allowed to resolve an interaction. The sandbox viewers render app-authorized relay sessions: the application mints one-time tickets, and the hub's `authorizeTerminal` or `authorizeDesktop` decides the sandbox, session, and any read-only grant. A viewer's `readOnly` prop is not an access-control decision.

The rich composer uses Tiptap and browser DOM behavior. Image zoom, selection tooling, attachments, and rich editing should run on the client in SSR applications.

See [components and theming](/packages/react/components-and-theming) and the
[primitives API reference](/packages/react/primitives-api-reference).
