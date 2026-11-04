# `@anvia/react-ui` API reference

The package exposes a convenience root, component-family subpaths, and a shared context entry point.
It exports no CSS. No public export is currently annotated as deprecated or experimental.

## Root entry point

```ts
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@anvia/react-ui'
```

The root exports the principal components, providers, hooks, and shared types from every family, except the sandbox viewers. `SandboxTerminal` and `SandboxDesktop` are available only from their own subpaths, so applications that never render a viewer do not need xterm or noVNC.

### Providers

```ts
type ChatController<
  Metadata extends ClientMetadata = ClientMetadata,
  Data extends ClientDataMap = ClientDataMap,
> = UseChatResult<ClientTransport<ClientStreamRequest, Data, Metadata>>

type ChatProviderProps<
  Metadata extends ClientMetadata = ClientMetadata,
  Data extends ClientDataMap = ClientDataMap,
> = {
  controller: ChatController<Metadata, Data>
  children?: ReactNode
}

function ChatProvider<Metadata extends ClientMetadata, Data extends ClientDataMap>(
  props: ChatProviderProps<Metadata, Data>,
): ReactElement

function useChatContext<Metadata extends ClientMetadata, Data extends ClientDataMap>():
  ChatController<Metadata, Data>
```

`ChatProvider` makes an `@anvia/react` `useChat` result available to chat, composer, message, and human-input primitives. `useChatContext` throws when used outside the provider.

```ts
type CompletionController<
  Metadata extends ClientMetadata = ClientMetadata,
  Data extends ClientDataMap = ClientDataMap,
> = UseCompletionResult<Metadata, Data>

type CompletionProviderProps<
  Metadata extends ClientMetadata = ClientMetadata,
  Data extends ClientDataMap = ClientDataMap,
> = {
  controller: CompletionController<Metadata, Data>
  children?: ReactNode
}

function CompletionProvider<Metadata extends ClientMetadata, Data extends ClientDataMap>(
  props: CompletionProviderProps<Metadata, Data>,
): ReactElement

function useCompletionContext<Metadata extends ClientMetadata, Data extends ClientDataMap>():
  CompletionController<Metadata, Data>
```

`CompletionProvider` supplies a `useCompletion` controller to the completion component family.

### `ContextMeterPrimitive`

```ts
type ContextMeterProps = Omit<PrimitiveProps<'div'>, 'children'> & {
  usage?: ContextUsage
  display?: 'remaining' | 'used'
  children?: ReactNode | ((usage: ContextUsage) => ReactNode)
}

const ContextMeterPrimitive: ForwardRefExoticComponent<ContextMeterProps>
```

Renders completion context usage. A render-function child receives the resolved `ContextUsage`; otherwise the component displays the selected percentage.

### Root export catalog

| Group | Symbols |
| --- | --- |
| Chat | `ChatProvider`, `ComposerPrimitive`, `ThreadPrimitive`, `useChatContext`, `useComposer`, `useThread`, `ComposerSubmitMessage`, `ComposerSubmitMessageArgs` |
| CompletionPrimitive | `CompletionPrimitive`, `CompletionProvider`, `useCompletionContext`, `useCompletionInput` |
| MessagePrimitive | `MessagePrimitive`, `useMessage`, `useMessagePart`, `MessageAttachmentPart`, `MessageEntityProps`, `MessagePartsFilter`, `MessageStreamOptions`, `MessageToolPart`, `MessageToolRenderWhen` |
| Human input | `HumanInputPrimitive`, `useApproval`, `useHumanInput`, `useQuestion`, `useQuestionPrompt` |
| Attachments and images | `AttachmentPrimitive`, `useAttachment`, `ImagePrimitive`, `useImage` |
| Selection | `SelectionToolbarPrimitive`, `useSelectionToolbar`, `SelectionToolbarSelection` |
| Context meter | `ContextMeterPrimitive`, `ContextMeterProps` |
| Streaming | `StreamMarkdown`, `StreamMarkdownProps` |
| ThreadPrimitive list | `ThreadListPrimitive`, `ThreadListItemPrimitive`, `ThreadListProvider`, `useThreadList`, `useThreadListItem`, `ThreadListController`, `ThreadListItemContextValue`, `ThreadListProviderProps`, `ThreadListRecord` |
| Shared context types | `ApprovalContextValue`, `AttachmentContextValue`, `ChatController`, `ChatProviderProps`, `CompletionController`, `CompletionInputContextValue`, `CompletionProviderProps`, `ComposerContextValue`, `ImageContextValue`, `MessageContextValue`, `MessagePartContextValue`, `QuestionContextValue`, `QuestionPromptContextValue`, `SelectionToolbarContextValue`, `ThreadContextValue` |
| ComposerPrimitive types | `ComposerAttachmentInput`, `ComposerAttachmentsUpdate`, `ComposerEntitiesUpdate`, `ComposerEntity`, `ComposerEntityData`, `ComposerMessageMetadata`, `ComposerQuote`, `ComposerTriggerDefinition`, `ComposerTriggerItem`, `ComposerTriggerItems`, `ComposerTriggerItemsArgs`, `ComposerTriggerState`, `ComposerTriggerStateUpdate` |
| Primitive types | `PrimitiveProps`, `PrimitiveRef` |

## `@anvia/react-ui/chat`

```ts
import {
  ChatProvider,
  ComposerPrimitive,
  ThreadPrimitive,
  useChatContext,
  useComposer,
  useThread,
} from '@anvia/react-ui/chat'
```

### `ComposerPrimitive`

`ComposerPrimitive` is a compound object with these public parts:

| Part | Role |
| --- | --- |
| `ComposerPrimitive.Root` | Form, controlled/uncontrolled input state, attachments, entities, quote, and submission |
| `ComposerPrimitive.Input` | Tiptap-backed rich input |
| `ComposerPrimitive.TextareaInput` | Native textarea alternative |
| `ComposerPrimitive.Attachments` | Renders the attachment collection |
| `ComposerPrimitive.AddAttachment` | Opens an attachment input |
| `ComposerPrimitive.AttachmentInput` | Hidden or custom file-input boundary |
| `ComposerPrimitive.AttachmentDropzone` | Handles drag-and-drop attachments |
| `ComposerPrimitive.Quote` | Renders the active quote |
| `ComposerPrimitive.ClearQuote` | Clears the quote |
| `ComposerPrimitive.TriggerMenu` | Renders matches for active inline triggers |
| `ComposerPrimitive.TriggerItem` | Renders one trigger result |
| `ComposerPrimitive.Submit` | Submits when content is present and the chat is not submitted or streaming |
| `ComposerPrimitive.Stop` | Stops the active chat request |

The root's important additional props are:

```ts
type ComposerRootProps = PrimitiveProps<'form'> & {
  attachments?: UIAttachment[]
  defaultAttachments?: UIAttachment[]
  defaultEntities?: ComposerEntity[]
  defaultInput?: string
  defaultQuote?: ComposerQuote
  entities?: ComposerEntity[]
  input?: string
  onAttachmentsChange?: (attachments: UIAttachment[]) => void
  onEntitiesChange?: (entities: ComposerEntity[]) => void
  onInputChange?: (input: string) => void
  onQuoteChange?: (quote: ComposerQuote | undefined) => void
  quote?: ComposerQuote
  submitMessage?: ComposerSubmitMessage
  triggers?: ComposerTriggerDefinition[]
}
```

```ts
type ComposerSubmitMessageArgs<Data extends ClientDataMap = ClientDataMap> = {
  input: string
  attachments: UIAttachment[]
  entities: ComposerEntity[]
  chat: ChatController<ClientMetadata, Data>
  quote?: ComposerQuote
  clear(): void
}

type ComposerSubmitMessage<Data extends ClientDataMap = ClientDataMap> = (
  args: ComposerSubmitMessageArgs<Data>,
) => Promise<void> | void
```

### `ThreadPrimitive`

`ThreadPrimitive` exposes `Root`, `Viewport`, `ViewportFooter`, `Messages`, `Empty`, `Status`, `Loading`, `Error`, `Suggestions`, `Suggestion`, and `ScrollToBottom`. The parts consume the current chat controller and thread context; ordinary DOM props and refs are forwarded.

### Other exports

The chat subpath also exports `ChatController`, `ChatProviderProps`, `ComposerAttachmentInput`, `ComposerAttachmentsUpdate`, `ComposerContextValue`, `ComposerEntitiesUpdate`, `ComposerEntity`, `ComposerEntityData`, `ComposerMessageMetadata`, `ComposerQuote`, `ComposerTriggerDefinition`, `ComposerTriggerItem`, `ComposerTriggerItems`, `ComposerTriggerItemsArgs`, `ComposerTriggerState`, `ComposerTriggerStateUpdate`, and `ThreadContextValue`.

## `@anvia/react-ui/completion`

```ts
import {
  CompletionPrimitive,
  CompletionProvider,
  useCompletionContext,
  useCompletionInput,
} from '@anvia/react-ui/completion'
```

`CompletionPrimitive` exposes `Root`, `Output`, `Form`, `Input`, `Submit`, and `Stop`. `Root` and `Form` establish the local completion-input context; `Output` reads the controller's completion; `Submit` and `Stop` delegate to the controller.

This entry point also exports `CompletionController`, `CompletionInputContextValue`, and `CompletionProviderProps`.

## `@anvia/react-ui/message`

```ts
import { MessagePrimitive, useMessage, useMessagePart } from '@anvia/react-ui/message'
```

`MessagePrimitive` is the largest compound component:

| Area | Parts |
| --- | --- |
| Structure | `Root`, `Content`, `Parts`, `Part` |
| Text | `Text`, `Markdown`, `CodeBlock` |
| Metadata | `Entity`, `Data`, `Error` |
| Reasoning | `Reasoning` |
| Tools | `Tool`, `ToolName`, `ToolInput`, `ToolOutput`, `ToolError`, `ToolStatus` |
| Attachments | `Attachment` |
| Actions | `Actions`, `Copy`, `Regenerate` |

`MessagePrimitive.Parts` can filter the source parts and accepts `MessageStreamOptions` for display smoothing. A render-function child receives the current part; the default renderer delegates to `MessagePrimitive.Part`.

Public types are `MessageContextValue`, `MessagePartContextValue`, `MessageAttachmentPart`, `MessageEntityProps`, `MessagePartsFilter`, `MessageStreamOptions`, `MessageToolPart`, and `MessageToolRenderWhen`. The entry point also exports `useChatContext` because message actions can regenerate the active response.

## `@anvia/react-ui/human-input`

```ts
import {
  HumanInputPrimitive,
  useApproval,
  useHumanInput,
  useQuestion,
  useQuestionPrompt,
} from '@anvia/react-ui/human-input'
```

`HumanInputPrimitive` exposes:

- `Panel` and `Status` for the overall pending-input state.
- `Approvals`, `Approval`, `ApprovalReason`, `Approve`, and `Reject` for tool decisions.
- `Questions`, `Question`, `QuestionPrompt`, `QuestionChoice`, `QuestionTextAnswer`, and `QuestionSubmit` for structured answers.

Collection parts establish the item contexts read by the corresponding hooks. This entry point also exports `ApprovalContextValue`, `QuestionContextValue`, and `QuestionPromptContextValue`.

## `@anvia/react-ui/attachment`

```ts
import { AttachmentPrimitive, useAttachment } from '@anvia/react-ui/attachment'
```

`AttachmentPrimitive` exposes `Root`, `Name`, `Preview`, and `Remove`. `useAttachment(): AttachmentContextValue` reads the attachment and optional remove action for the current item.

## `@anvia/react-ui/image`

```ts
import { ImagePrimitive, useImage } from '@anvia/react-ui/image'
```

`ImagePrimitive` exposes `Root`, `Preview`, `Name`, `Actions`, `Copy`, `Download`, `ZoomTrigger`, and `ZoomOverlay`. `useImage(): ImageContextValue` reads the current image state. `ZoomOverlay` accepts an optional `container: Element | DocumentFragment` for its portal target.

## `@anvia/react-ui/selection-toolbar`

```ts
import {
  SelectionToolbarPrimitive,
  useSelectionToolbar,
} from '@anvia/react-ui/selection-toolbar'
```

`SelectionToolbarPrimitive` exposes `Root`, `Quote`, and `Copy`.

```ts
type SelectionToolbarSelection = {
  text: string
  messageId: string
  rect: DOMRect
}

function useSelectionToolbar(): SelectionToolbarContextValue
```

The context reports the current selection and toolbar actions.

## `@anvia/react-ui/thread-list`

```ts
import {
  ThreadListPrimitive,
  ThreadListItemPrimitive,
  ThreadListProvider,
} from '@anvia/react-ui/thread-list'
```

`ThreadListPrimitive` exposes `Root`, `New`, `Items`, and `Empty`. `ThreadListItemPrimitive` exposes `Root`, `Trigger`, `Title`, `Archive`, `Unarchive`, and `Delete`.

```ts
type ThreadListRecord = {
  id: string
  title?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  archived?: boolean
  metadata?: unknown
}

type ThreadListController = {
  threads: ThreadListRecord[]
  activeThreadId?: string
  status?: 'idle' | 'loading' | 'error'
  error?: unknown
  createThread(): Promise<void> | void
  switchThread(threadId: string): Promise<void> | void
  archiveThread?(threadId: string): Promise<void> | void
  unarchiveThread?(threadId: string): Promise<void> | void
  deleteThread?(threadId: string): Promise<void> | void
}
```

`ThreadListProvider` accepts `{ controller, children? }`. `useThreadList()` returns the controller; `useThreadListItem()` returns `{ thread, active }` inside `ThreadListPrimitive.Items`.

## `@anvia/react-ui/graph-explorer`

```ts
import {
  GraphExplorerNodePrimitive,
  GraphExplorerPrimitive,
  GraphExplorerProvider,
  graphExplorerNodeLabel,
  useGraphExplorerContext,
  useGraphExplorerNode,
} from '@anvia/react-ui/graph-explorer'
```

These primitives compose the controller returned by `useGraphExplorer()` in `@anvia/react/graph-explorer`; they render no graph layout themselves.

`GraphExplorerPrimitive` is a compound object with these public parts:

| Part | Role |
| --- | --- |
| `GraphExplorerPrimitive.Root` | Container element for the explorer |
| `GraphExplorerPrimitive.Search` | Input wired to the controller's `setQuery()` |
| `GraphExplorerPrimitive.Viewport` | Area for application-owned node rendering |
| `GraphExplorerPrimitive.Nodes` | Iterates the controller's nodes and establishes each node context; `data-state` is `empty` or `populated` |
| `GraphExplorerPrimitive.Empty` | Renders when no nodes are loaded and status is not `loading` |
| `GraphExplorerPrimitive.Status` | Renders status text; `data-state` mirrors the controller status |
| `GraphExplorerPrimitive.Refresh` | Calls the controller's `refresh()`; disabled while loading |

`GraphExplorerPrimitive.Nodes` accepts `keepMounted` and a render-function child `(node, state)`; without children it renders a default `GraphExplorerNodePrimitive.Root` with `Trigger` per node. `GraphExplorerNodePrimitive` exposes `Root`, `Trigger`, and `Expand`: `Root` accepts an optional `nodeId` (inferred inside `Nodes`) and reflects `data-state` selection plus `data-match`, `data-node-id`, and `data-node-type`; `Trigger` selects the node and defaults to `graphExplorerNodeLabel(node)`; `Expand` calls `expandNode(nodeId, options)` and is disabled while loading.

`GraphExplorerProvider` accepts `{ controller, children? }`. `useGraphExplorerContext()` returns the `GraphExplorerController` and throws outside the provider; `useGraphExplorerNode()` returns the `{ node, selected, matched }` item context.

The entry point also exports the `GraphExplorerController`, `GraphExplorerExpandNodeOptions`, `GraphExplorerNodeContextValue`, `GraphExplorerProviderProps`, `GraphExplorerStatus`, and `GraphExplorerNodeRootProps` types.

## `@anvia/react-ui/sandbox-terminal`

```ts
import { SandboxTerminal } from '@anvia/react-ui/sandbox-terminal'
```

`SandboxTerminal` draws a remote sandbox session's terminal with xterm.js and speaks the terminal relay of `RemoteSandboxHub` (`hub.handleTerminalUpgrade`). It is not exported from the root entry point. xterm is loaded on demand, and `@xterm/xterm` (>=5.5.0) and `@xterm/addon-fit` (>=0.10.0) are optional peer dependencies, so an application that never renders a terminal never needs them.

```ts
import type { ITerminalOptions } from '@xterm/xterm'

type SandboxTerminalProps = Omit<PrimitiveProps<'div'>, 'children' | 'onError'> & {
  url: string
  sessionName?: string
  ticket?: string | (() => string | Promise<string>)
  readOnly?: boolean
  reconnect?: SandboxTerminalReconnectOptions
  terminalOptions?: ITerminalOptions
  onStatusChange?: (status: SandboxTerminalStatus) => void
  renderStatus?: (status: SandboxTerminalStatus, retry: () => void) => ReactNode
}

interface SandboxTerminalHandle {
  focus(): void
  reconnect(): void
}

type SandboxTerminalReconnectOptions = {
  initialDelayMs?: number
  maxDelayMs?: number
  maxAttempts?: number
}

type SandboxTerminalState = 'loading' | 'connecting' | 'open' | 'reconnecting' | 'ended' | 'failed'

type SandboxTerminalStatus = {
  state: SandboxTerminalState
  attempt?: number
  retryInMs?: number
  exitCode?: number
  message?: string
}
```

| Prop | Purpose |
| --- | --- |
| `url` | The hub's terminal endpoint: `ws:`/`wss:`, `http:`/`https:`, or a path relative to the page. |
| `sessionName` | Sent as `?session=` so `authorizeTerminal` can choose the session. It is a hint; the server decides which session a ticket grants. |
| `ticket` | A one-time ticket, or a function returning one. It travels as the `anvia.ticket.<ticket>` WebSocket subprotocol, not in the URL, and must use only URL-safe characters. Pass a function: tickets are single use, so every reconnect needs a fresh one. |
| `readOnly` | Stops this viewer sending input and resize messages. xterm is created with stdin disabled and cursor blinking off unless `terminalOptions` overrides those settings, and the relay enforces any read-only grant it issued as well. |
| `reconnect` | Backoff options: `initialDelayMs` (default 500), `maxDelayMs` (default 15,000), and `maxAttempts` (default 10). |
| `terminalOptions` | xterm options such as `fontSize` or `theme`, applied when the terminal is created. The component's defaults are a 5,000-line scrollback, cursor blinking unless `readOnly`, and stdin disabled when `readOnly` is true. |
| `onStatusChange` | Called with every connection state change, starting with `loading`. |
| `renderStatus` | Replaces the default status line. Receives the current status and a retry callback; return `null` to show nothing. |

The component also accepts ordinary `div` props except `children` and `onError`, including `className`, `style`, and `data-*`. It fills its parent, so give the parent a height. A `ResizeObserver` refits the terminal and sends the new size to the sandbox. Changing `url`, `sessionName`, or `readOnly` tears down the terminal and creates a new connection; the other props are read when needed.

A connection is `loading`, `connecting`, `open`, `reconnecting`, `ended`, or `failed`. `ended` means the shell exited and is not retried. `failed` means a fatal error or that reconnect attempts ran out. After a reconnect the screen is cleared before the session redraws, and focus returns to the terminal unless it is read-only. The root element carries the state as `data-state` and `data-readonly` while the viewer is read-only. The default status line is a `role="status"` element with `data-relay-status`; after a failure it offers a Retry button. A `ref` exposes `focus()` and `reconnect()`; `reconnect()` retries only after the viewer gave up.

Import xterm's stylesheet once in the application:

```ts
import '@xterm/xterm/css/xterm.css'
```

The subpath also exports `terminalSubprotocol` (`"anvia.terminal.v1"`), `ticketSubprotocolPrefix` (`"anvia.ticket."`), and the `SandboxTerminalReconnectOptions`, `SandboxTerminalState`, `SandboxTerminalStatus`, and `SandboxTerminalHandle` types.

### Authorization boundary

The component does not choose who may see a session and does not mint or validate tickets. The application's backend mints the ticket, and the hub's `authorizeTerminal` redeems it and returns the sandbox, `sessionName`, and optional `readOnly` grant. That server-side grant is authoritative: the relay drops input and resize messages from a read-only viewer. Setting `readOnly` on the component is a UI and client-side guard, not an access-control decision. See [terminal behavior and security](/sdk/advanced/sandbox/terminals).

## `@anvia/react-ui/sandbox-desktop`

```ts
import { SandboxDesktop } from '@anvia/react-ui/sandbox-desktop'
```

`SandboxDesktop` shows a remote sandbox's desktop with noVNC and lets a person take control from the agent. It speaks the desktop relay of `RemoteSandboxHub` (`hub.handleDesktopUpgrade`). It is not exported from the root entry point, and `@novnc/novnc` (>=1.5.0) is an optional peer dependency loaded on demand.

```ts
type SandboxDesktopProps = Omit<PrimitiveProps<'div'>, 'children' | 'onError'> & {
  url: string
  ticket?: string | (() => string | Promise<string>)
  readOnly?: boolean
  scaleToFit?: boolean
  qualityLevel?: number
  compressionLevel?: number
  reconnect?: SandboxDesktopReconnectOptions
  onStatusChange?: (status: SandboxDesktopStatus) => void
  onControlChange?: (control: SandboxDesktopControl) => void
  renderStatus?: (status: SandboxDesktopStatus, retry: () => void) => ReactNode
  renderControls?: (state: SandboxDesktopControlsState) => ReactNode
}

interface SandboxDesktopHandle {
  focus(): void
  reconnect(): void
  takeOver(): void
  release(): void
}

interface SandboxDesktopControl {
  held: boolean
  holder?: string
  expiresAt?: string
  you: boolean
  readOnly: boolean
}

interface SandboxDesktopNotice {
  code: string
  message: string
}

interface SandboxDesktopControlsState {
  status: SandboxDesktopStatus
  control: SandboxDesktopControl | undefined
  readOnly: boolean
  notice: SandboxDesktopNotice | undefined
  takeOver(): void
  release(): void
}
```

`SandboxDesktopReconnectOptions`, `SandboxDesktopState`, and `SandboxDesktopStatus` alias the shared relay option, state, and status types shown for the terminal. In `SandboxDesktopControlsState`, `readOnly` combines the prop and the relay's read-only grant; it does not mean another viewer holds control.

| Prop | Purpose |
| --- | --- |
| `url` | The hub's desktop endpoint: `ws:`/`wss:`, `http:`/`https:`, or a path relative to the page. |
| `ticket` | A one-time ticket, or a function returning one, sent as the `anvia.ticket.<ticket>` subprotocol. Pass a function so each reconnect gets a fresh one. The desktop viewer has no `sessionName` prop; the ticket and `authorizeDesktop` select the sandbox. |
| `readOnly` | Asks this viewer to watch only. The relay also removes a read-only viewer's key, pointer, clipboard, and resize messages. |
| `scaleToFit` | Scales the desktop to the element. Default `true`; `false` shows it at its own size. A viewer never resizes the session; use the hub's desktop API for that. |
| `qualityLevel` | JPEG quality requested from the server, 0 (smallest, blockiest) to 9 (best, most data). Default 6. Values are rounded and clamped, and non-finite values fall back to the default. Changes apply to the live connection. |
| `compressionLevel` | Server compression effort, 0 (fastest, most data) to 9 (slowest, least data). Default 2. Values are rounded and clamped, and non-finite values fall back to the default. Changes apply to the live connection. |
| `reconnect` | Backoff options with the same defaults as the terminal: 500 ms, 15 s, and 10 attempts. |
| `onStatusChange` | Called with every connection state change, starting with `loading`. |
| `onControlChange` | Called whenever the relay reports who has control. |
| `renderStatus` | Replaces the default status line. Receives the current status and a retry callback; return `null` to show nothing. |
| `renderControls` | Replaces the default take-over bar. Receives `{ status, control, readOnly, notice, takeOver, release }`; return `null` to show nothing. |

The component also accepts ordinary `div` props except `children` and `onError`. It fills its parent, so give the parent a height. Changing `url` reconnects; `readOnly`, `scaleToFit`, `qualityLevel`, and `compressionLevel` update the live viewer. Each accepted attachment gets a new noVNC client, and each reconnect uses a fresh ticket.

### Status and control

The desktop uses the shared relay states: `loading`, `connecting`, `open`, `reconnecting`, and `failed`. A relay that cannot set the viewer up closes with a reason such as `unsupported: ...`; that stops the viewer when retrying cannot help, while `sandbox_unavailable` and `timeout` are retried. The root element carries the state as `data-state`. The default status line is a `role="status"` element with `data-relay-status` and offers a Retry button after a failure.

Until the relay says who has control, the viewer is view-only. `control` is undefined and the default bar is hidden. After the relay reports state, the bar shows "The agent has control", "`<holder>` has control", "You have control", or "View only". "Take over" asks the relay for control, which pauses the agent's inputs (`desktop_locked`) until "Release" or until the hold lease is released. While someone else holds control there is no take-over button, and this viewer sends no input. A refused request, such as taking over while someone else holds control, appears as `notice` until the next control update. Closing the tab releases the hold. `onControlChange` receives `SandboxDesktopControl`; control is forgotten while the link is down.

The root also exposes `data-readonly` whenever this viewer is view-only, which includes the `readOnly` prop, a read-only ticket grant, and any time this viewer does not hold control. `data-control` is `you`, `other`, or `none`. A `ref` exposes `focus()`, `reconnect()`, `takeOver()`, and `release()`; `reconnect()` retries only after the viewer gave up.

### Authorization boundary

The component does not authorize desktop access or control. The application's backend mints the ticket, and the hub's `authorizeDesktop` redeems it and returns the sandbox, optional `readOnly` grant, and holder identity. The relay is authoritative: it filters keyboard, pointer, clipboard, and resize input from read-only viewers, and only the current holder's input reaches the desktop. A `readOnly` prop is a local UI and client-side guard; a read-only grant in the ticket wins even when the prop is absent. The component's take-over action only asks the relay; it cannot grant control itself. See [desktop behavior and control](/sdk/advanced/sandbox/desktop).

The subpath also exports `desktopSubprotocol` (`"anvia.desktop.v1"`), `ticketSubprotocolPrefix` (`"anvia.ticket."`), and the `SandboxDesktopControl`, `SandboxDesktopControlsState`, `SandboxDesktopHandle`, `SandboxDesktopNotice`, and `SandboxDesktopProps` types.

## `@anvia/react-ui/stream`

```ts
type StreamMarkdownProps = Omit<PrimitiveProps<'div'>, 'children'> & {
  'data-state'?: string | undefined
  components?: Components
  content: string
  live?: boolean
  remarkPlugins?: ReactMarkdownOptions['remarkPlugins']
  remarkRehypeOptions?: ReactMarkdownOptions['remarkRehypeOptions']
}

const StreamMarkdown: ForwardRefExoticComponent<StreamMarkdownProps>
```

Renders GFM Markdown from an app-owned string. Set `live` only while the final block is growing.
An explicit `data-state` prop overrides the root attribute, which is `streaming` while `live` and
`idle` otherwise. Supplying `remarkPlugins` replaces the default GFM plugin list. The growing tail
exposes `data-state="revealing"`; the owning application supplies any transition.

## `@anvia/react-ui/shared`

This entry point exposes shared providers, hooks, context types, and primitive types without importing compound component objects.

```ts
type PrimitiveProps<TElement extends ElementType = 'div'> = Omit<
  ComponentPropsWithoutRef<TElement>,
  'asChild'
> & {
  asChild?: boolean
}

type PrimitiveRef<TElement extends ElementType> =
  ComponentPropsWithRef<TElement>['ref']
```

Exports include `ChatProvider`, `CompletionProvider`, `ThreadListProvider`; every public `use...` context hook; the context and composer types listed in the root catalog; and `PrimitiveProps` and `PrimitiveRef`.

## Styling contract

There are no CSS entry points. Primitives forward `className` and ordinary DOM props, support
`asChild` where applicable, and expose a small semantic contract through ARIA, `data-state`, and
`data-role`. Use [`@anvia/cli`](/packages/cli) for editable application components and reveal CSS.

Return to the [`@anvia/react-ui` overview](/packages/react-ui).
