# `@anvia/react-ui` API reference

The package exposes a convenience root, component-family subpaths, a shared context entry point, and two CSS entry points. No public export is currently annotated as deprecated or experimental.

## Root entry point

```ts
import {
  ChatProvider,
  Composer,
  Message,
  Thread,
} from '@anvia/react-ui'
```

The root exports the principal components, providers, hooks, and shared types from every family.

### Providers

```ts
type ChatController<TEvent = unknown> = UseChatResult<TEvent>

type ChatProviderProps<TEvent = unknown> = {
  controller: ChatController<TEvent>
  children?: ReactNode
}

function ChatProvider<TEvent = unknown>(
  props: ChatProviderProps<TEvent>,
): ReactElement

function useChatContext<TEvent = unknown>(): ChatController<TEvent>
```

`ChatProvider` makes an `@anvia/react` `useChat` result available to chat, composer, message, and human-input primitives. `useChatContext` throws when used outside the provider.

```ts
type CompletionController<TEvent = unknown> = UseCompletionResult<TEvent>

type CompletionProviderProps<TEvent = unknown> = {
  controller: CompletionController<TEvent>
  children?: ReactNode
}

function CompletionProvider<TEvent = unknown>(
  props: CompletionProviderProps<TEvent>,
): ReactElement

function useCompletionContext<TEvent = unknown>(): CompletionController<TEvent>
```

`CompletionProvider` supplies a `useCompletion` controller to the completion component family.

### `ContextMeter`

```ts
type ContextMeterProps = Omit<PrimitiveProps<'div'>, 'children'> & {
  usage?: ContextUsage
  display?: 'remaining' | 'used'
  children?: ReactNode | ((usage: ContextUsage) => ReactNode)
}

const ContextMeter: ForwardRefExoticComponent<ContextMeterProps>
```

Renders completion context usage. A render-function child receives the resolved `ContextUsage`; otherwise the component displays the selected percentage.

### Root export catalog

| Group | Symbols |
| --- | --- |
| Chat | `ChatProvider`, `Composer`, `Thread`, `useChatContext`, `useComposer`, `useThread`, `ComposerSubmitMessage`, `ComposerSubmitMessageArgs` |
| Completion | `Completion`, `CompletionProvider`, `useCompletionContext`, `useCompletionInput` |
| Message | `Message`, `useMessage`, `useMessagePart`, `MessageAttachmentPart`, `MessageEntityProps`, `MessagePartsFilter`, `MessageStreamOptions`, `MessageToolPart`, `MessageToolRenderWhen` |
| Human input | `HumanInput`, `useApproval`, `useHumanInput`, `useQuestion`, `useQuestionPrompt` |
| Attachments and images | `Attachment`, `useAttachment`, `Image`, `useImage` |
| Selection | `SelectionToolbar`, `useSelectionToolbar`, `SelectionToolbarSelection` |
| Streaming | `StreamMarkdown`, `StreamMarkdownProps` |
| Thread list | `ThreadList`, `ThreadListItem`, `ThreadListProvider`, `useThreadList`, `useThreadListItem`, `ThreadListController`, `ThreadListItemContextValue`, `ThreadListProviderProps`, `ThreadListRecord` |
| Shared context types | `ApprovalContextValue`, `AttachmentContextValue`, `ChatController`, `ChatProviderProps`, `CompletionController`, `CompletionInputContextValue`, `CompletionProviderProps`, `ComposerContextValue`, `ImageContextValue`, `MessageContextValue`, `MessagePartContextValue`, `QuestionContextValue`, `QuestionPromptContextValue`, `SelectionToolbarContextValue`, `ThreadContextValue` |
| Composer types | `ComposerAttachmentInput`, `ComposerAttachmentsUpdate`, `ComposerEntitiesUpdate`, `ComposerEntity`, `ComposerEntityData`, `ComposerMessageMetadata`, `ComposerQuote`, `ComposerTriggerDefinition`, `ComposerTriggerItem`, `ComposerTriggerItems`, `ComposerTriggerItemsArgs`, `ComposerTriggerState`, `ComposerTriggerStateUpdate` |
| Primitive types | `PrimitiveProps`, `PrimitiveRef` |

## `@anvia/react-ui/chat`

```ts
import {
  ChatProvider,
  Composer,
  Thread,
  useChatContext,
  useComposer,
  useThread,
} from '@anvia/react-ui/chat'
```

### `Composer`

`Composer` is a compound object with these public parts:

| Part | Role |
| --- | --- |
| `Composer.Root` | Form, controlled/uncontrolled input state, attachments, entities, quote, and submission |
| `Composer.Input` | Tiptap-backed rich input |
| `Composer.TextareaInput` | Native textarea alternative |
| `Composer.Attachments` | Renders the attachment collection |
| `Composer.AddAttachment` | Opens an attachment input |
| `Composer.AttachmentInput` | Hidden or custom file-input boundary |
| `Composer.AttachmentDropzone` | Handles drag-and-drop attachments |
| `Composer.Quote` | Renders the active quote |
| `Composer.ClearQuote` | Clears the quote |
| `Composer.TriggerMenu` | Renders matches for active inline triggers |
| `Composer.TriggerItem` | Renders one trigger result |
| `Composer.Submit` | Submits when content is present and the chat is idle |
| `Composer.Stop` | Stops the active chat request |

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
type ComposerSubmitMessageArgs<TEvent = unknown> = {
  input: string
  attachments: UIAttachment[]
  entities: ComposerEntity[]
  chat: ChatController<TEvent>
  quote?: ComposerQuote
  clear(): void
}

type ComposerSubmitMessage<TEvent = unknown> = (
  args: ComposerSubmitMessageArgs<TEvent>,
) => Promise<void> | void
```

### `Thread`

`Thread` exposes `Root`, `Viewport`, `ViewportFooter`, `Messages`, `Empty`, `Status`, `Loading`, `Error`, `Suggestions`, `Suggestion`, and `ScrollToBottom`. The parts consume the current chat controller and thread context; ordinary DOM props and refs are forwarded.

### Other exports

The chat subpath also exports `ChatController`, `ChatProviderProps`, `ComposerAttachmentInput`, `ComposerAttachmentsUpdate`, `ComposerContextValue`, `ComposerEntitiesUpdate`, `ComposerEntity`, `ComposerEntityData`, `ComposerMessageMetadata`, `ComposerQuote`, `ComposerTriggerDefinition`, `ComposerTriggerItem`, `ComposerTriggerItems`, `ComposerTriggerItemsArgs`, `ComposerTriggerState`, `ComposerTriggerStateUpdate`, and `ThreadContextValue`.

## `@anvia/react-ui/completion`

```ts
import {
  Completion,
  CompletionProvider,
  useCompletionContext,
  useCompletionInput,
} from '@anvia/react-ui/completion'
```

`Completion` exposes `Root`, `Output`, `Form`, `Input`, `Submit`, and `Stop`. `Root` and `Form` establish the local completion-input context; `Output` reads the controller's completion; `Submit` and `Stop` delegate to the controller.

This entry point also exports `CompletionController`, `CompletionInputContextValue`, and `CompletionProviderProps`.

## `@anvia/react-ui/message`

```ts
import { Message, useMessage, useMessagePart } from '@anvia/react-ui/message'
```

`Message` is the largest compound component:

| Area | Parts |
| --- | --- |
| Structure | `Root`, `Content`, `Parts`, `Part` |
| Text | `Text`, `Markdown`, `CodeBlock` |
| Metadata | `Entity`, `Data`, `Error` |
| Reasoning | `Reasoning` |
| Tools | `Tool`, `ToolName`, `ToolInput`, `ToolOutput`, `ToolError`, `ToolStatus` |
| Attachments | `Attachment` |
| Actions | `Actions`, `Copy`, `Regenerate` |

`Message.Parts` can filter the source parts and accepts `MessageStreamOptions` for display smoothing. A render-function child receives the current part; the default renderer delegates to `Message.Part`.

Public types are `MessageContextValue`, `MessagePartContextValue`, `MessageAttachmentPart`, `MessageEntityProps`, `MessagePartsFilter`, `MessageStreamOptions`, `MessageToolPart`, and `MessageToolRenderWhen`. The entry point also exports `useChatContext` because message actions can regenerate the active response.

## `@anvia/react-ui/human-input`

```ts
import {
  HumanInput,
  useApproval,
  useHumanInput,
  useQuestion,
  useQuestionPrompt,
} from '@anvia/react-ui/human-input'
```

`HumanInput` exposes:

- `Panel` and `Status` for the overall pending-input state.
- `Approvals`, `Approval`, `ApprovalReason`, `Approve`, and `Reject` for tool decisions.
- `Questions`, `Question`, `QuestionPrompt`, `QuestionChoice`, `QuestionTextAnswer`, and `QuestionSubmit` for structured answers.

Collection parts establish the item contexts read by the corresponding hooks. This entry point also exports `ApprovalContextValue`, `QuestionContextValue`, and `QuestionPromptContextValue`.

## `@anvia/react-ui/attachment`

```ts
import { Attachment, useAttachment } from '@anvia/react-ui/attachment'
```

`Attachment` exposes `Root`, `Name`, `Preview`, and `Remove`. `useAttachment(): AttachmentContextValue` reads the attachment and optional remove action for the current item.

## `@anvia/react-ui/image`

```ts
import { Image, useImage } from '@anvia/react-ui/image'
```

`Image` exposes `Root`, `Preview`, `Name`, `Actions`, `Copy`, `Download`, `ZoomTrigger`, and `ZoomOverlay`. `useImage(): ImageContextValue` reads the current image state. `ZoomOverlay` accepts an optional `container: Element | DocumentFragment` for its portal target.

## `@anvia/react-ui/selection-toolbar`

```ts
import {
  SelectionToolbar,
  useSelectionToolbar,
} from '@anvia/react-ui/selection-toolbar'
```

`SelectionToolbar` exposes `Root`, `Quote`, and `Copy`.

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
  ThreadList,
  ThreadListItem,
  ThreadListProvider,
} from '@anvia/react-ui/thread-list'
```

`ThreadList` exposes `Root`, `New`, `Items`, and `Empty`. `ThreadListItem` exposes `Root`, `Trigger`, `Title`, `Archive`, `Unarchive`, and `Delete`.

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

`ThreadListProvider` accepts `{ controller, children? }`. `useThreadList()` returns the controller; `useThreadListItem()` returns `{ thread, active }` inside `ThreadList.Items`.

## `@anvia/react-ui/stream`

```ts
type StreamMarkdownProps = Omit<PrimitiveProps<'div'>, 'children'> & {
  components?: Components
  content: string
  live?: boolean
  remarkPlugins?: ReactMarkdownOptions['remarkPlugins']
  remarkRehypeOptions?: ReactMarkdownOptions['remarkRehypeOptions']
}

const StreamMarkdown: ForwardRefExoticComponent<StreamMarkdownProps>
```

Renders GFM Markdown from an app-owned string. Set `live` only while the final block is growing. Supplying `remarkPlugins` replaces the default GFM plugin list. Import `@anvia/react-ui/stream/styles.css` for the settle animation.

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

## CSS entry points

```ts
import '@anvia/react-ui/styles.css'
import '@anvia/react-ui/stream/styles.css'
```

These entry points export stylesheets only. The root file provides optional base component styles; the stream file provides the `StreamMarkdown` reveal transition.

Return to the [`@anvia/react-ui` overview](/packages/react-ui).
