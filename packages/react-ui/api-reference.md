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

The root exports the principal components, providers, hooks, and shared types from every family.

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
