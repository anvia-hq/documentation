# `@anvia/react` API reference

All exports come from the package root:

```ts
import { useChat, createFetchTransport } from '@anvia/react'
```

The package also re-exports `CreateUIAttachment`, `UIAttachment`, `UIError`, `UIMessage`, `UIMessagePart`, `UIMessageRole`, `UIStreamEvent`, `UIStreamRequest`, and `UIStreamResume` from `@anvia/core/ui`.

No public export is currently annotated as deprecated or experimental.

## `useChat`

```ts
function useChat<
  TRequest = UIStreamRequest,
  TEvent = UIStreamEvent,
>(options?: UseChatOptions<TRequest, TEvent>): UseChatResult<TEvent>
```

Owns UI messages and streamed events for a conversation. Generic request and event types let a custom transport use a non-default protocol.

```ts
type UseChatOptions<TRequest = UIStreamRequest, TEvent = UIStreamEvent> = {
  transport?: EventTransport<TRequest, TEvent>
  endpoint?: string | URL
  format?: 'jsonl' | 'sse'
  initialMessages?: UIMessage[]
  resume?: ChatResumeOptions
  createRequest?: (args: CreateChatRequestArgs) => TRequest
  eventToUIEvent?: (event: TEvent) => UIStreamEvent | undefined
  eventToDelta?: (event: TEvent) => string | undefined
  eventToFinal?: (event: TEvent) => string | undefined
  humanInput?: HumanInputOptions<TEvent>
  suggestions?: ChatSuggestion[]
  onEvent?: (event: TEvent) => void
  onError?: (error: unknown) => void
}
```

`transport` takes precedence over `endpoint` and `format`. `createRequest` receives UI messages, converted Core messages, and an optional resume cursor.

```ts
type UseChatResult<TEvent = UIStreamEvent> = {
  messages: UIMessage[]
  events: TEvent[]
  contextUsage: ContextUsage | undefined
  suggestions?: ChatSuggestion[]
  setMessages: (
    messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[]),
  ) => void
  sendMessage(input: SendMessageInput): Promise<void>
  send(input?: string): Promise<void>
  regenerate(): Promise<void>
  stop(): void
  reset(messages?: UIMessage[]): void
  status: 'idle' | 'streaming' | 'error'
  error: unknown
  text: string
  streamId?: string
  isResuming: boolean
  resume(): Promise<void>
  humanInput: HumanInputState
  decidingApprovals: ReadonlySet<string>
  answeringQuestions: ReadonlySet<string>
  approveTool(approvalId: string, reason?: string): Promise<void>
  rejectTool(approvalId: string, reason?: string): Promise<void>
  answerToolQuestion(
    questionId: string,
    answers: ToolQuestionAnswer[],
  ): Promise<void>
}
```

`sendMessage` accepts text, an existing `UIMessage`, or an object with text, attachments, and metadata. `stop` aborts the active transport request. `reset` clears run state and optionally installs a new transcript.

## `useCompletion`

```ts
function useCompletion<
  TRequest = UIStreamRequest,
  TEvent = UIStreamEvent,
>(options?: UseCompletionOptions<TRequest, TEvent>): UseCompletionResult<TEvent>
```

Provides input and accumulated completion state for prompt-oriented interfaces.

```ts
type UseCompletionOptions<TRequest = UIStreamRequest, TEvent = UIStreamEvent> = {
  transport?: EventTransport<TRequest, TEvent>
  endpoint?: string | URL
  format?: 'jsonl' | 'sse'
  initialMessages?: UIMessage[]
  initialCompletion?: string
  createRequest?: (args: UseCompletionRequestArgs) => TRequest
  eventToUIEvent?: (event: TEvent) => UIStreamEvent | undefined
  eventToDelta?: (event: TEvent) => string | undefined
  eventToFinal?: (event: TEvent) => string | undefined
  onEvent?: (event: TEvent) => void
  onError?: (error: unknown) => void
}

type UseCompletionResult<TEvent = UIStreamEvent> = {
  messages: UIMessage[]
  completion: string
  input: string
  setInput(input: string): void
  complete(prompt?: string): Promise<void>
  stop(): void
  reset(messagesOrCompletion?: UIMessage[] | string): void
  status: 'idle' | 'streaming' | 'error'
  error: unknown
  events: TEvent[]
  contextUsage: ContextUsage | undefined
}
```

## Transports

### `EventTransport`

```ts
type TransportOptions = {
  signal?: AbortSignal
  headers?: HeadersInit
}

type EventTransport<TRequest, TEvent> = {
  send(
    request: TRequest,
    options?: TransportOptions,
  ): AsyncIterable<TEvent>
}
```

### `createFetchTransport`

```ts
function createFetchTransport<TRequest, TEvent = unknown>(
  options: CreateFetchTransportOptions<TRequest, TEvent>,
): EventTransport<TRequest, TEvent>

function createChatTransport<TRequest, TEvent = unknown>(
  options: CreateFetchTransportOptions<TRequest, TEvent>,
): EventTransport<TRequest, TEvent>
```

```ts
type CreateFetchTransportOptions<TRequest, TEvent> = {
  endpoint: string | URL | ((request: TRequest) => string | URL)
  method?: string
  format?: 'jsonl' | 'sse'
  fetch?: typeof fetch
  headers?: HeadersInit | (
    (request: TRequest) => HeadersInit | Promise<HeadersInit>
  )
  body?: (
    request: TRequest,
  ) => BodyInit | null | undefined | Promise<BodyInit | null | undefined>
  init?: Omit<RequestInit, 'body' | 'headers' | 'method' | 'signal'>
  mapEvent?: (event: unknown) => TEvent
}
```

`createChatTransport` is the chat-named fetch transport factory. Both return the same `EventTransport` boundary.

### `createDirectTransport`

```ts
function createDirectTransport<TRequest, TEvent>(
  handler: (request: TRequest) => AsyncIterable<TEvent>,
): EventTransport<TRequest, TEvent>
```

Runs the handler in process. The returned transport still observes the caller's abort signal between yielded events.

### `fetchEventStream`

```ts
function fetchEventStream<TEvent>(
  input: string | URL | Request,
  options?: FetchEventStreamOptions,
): AsyncIterable<TEvent>

type FetchEventStreamOptions = Omit<RequestInit, 'headers'> & {
  format?: 'jsonl' | 'sse'
  fetch?: typeof fetch
  headers?: HeadersInit
}
```

Throws `EventStreamHttpError` for a non-success response. The error exposes the original `response` and decoded `body`.

### Stream readers

```ts
function readJsonlStream<TEvent>(
  stream: ReadableStream<Uint8Array>,
): AsyncIterable<TEvent>

function readSseStream<TEvent>(
  stream: ReadableStream<Uint8Array>,
): AsyncIterable<TEvent>
```

Both readers decode UTF-8 and yield parsed JSON values. `readSseStream` reads JSON from SSE `data:` fields.

## Stream smoothing

```ts
type StreamSmoothingLifecycle = {
  isStreaming: boolean
  resetKey: string | number
  flushImmediately?: boolean
}

function useSmoothStreamText(
  content: string,
  options: StreamSmoothingLifecycle,
): {
  text: string
  isAnimating: boolean
  isDraining: boolean
  flush(): void
}
```

`useSmoothStreamText` paces an append-only string for display. `flushImmediately` skips the remaining animation, typically for terminal errors.

```ts
type SmoothStreamItemAdapter<T> = {
  getKey(item: T): string
  getText(item: T): string | undefined
  withText(item: T, text: string): T
}

function useSmoothStreamItems<T>(
  items: readonly T[],
  options: StreamSmoothingLifecycle & {
    adapter: SmoothStreamItemAdapter<T>
  },
): {
  items: readonly T[]
  isAnimating: boolean
  isDraining: boolean
  liveItemKey: string | null
  flush(): void
}
```

The adapter identifies items and describes how text is read and replaced. Non-text items keep their ordering while preceding text drains.

## Human input

```ts
function defaultEventToApproval<TEvent>(
  event: TEvent,
): ToolApproval | undefined

function defaultEventToQuestion<TEvent>(
  event: TEvent,
): ToolQuestion | undefined

function defaultDecideApproval(
  input: ToolApprovalDecisionInput,
  options: { endpoint?: string | URL; fetch?: typeof fetch },
): Promise<ToolApproval | undefined>

function defaultAnswerQuestion(
  input: ToolQuestionAnswerInput,
  options: { endpoint?: string | URL; fetch?: typeof fetch },
): Promise<ToolQuestion | undefined>
```

The event adapters recognize the standard tool human-input events. The default mutations call the configured endpoint; custom functions can replace either boundary through `HumanInputOptions`.

Public human-input data types are `HumanInputOptions`, `HumanInputState`, `ToolApproval`, `ToolApprovalDecisionInput`, `ToolApprovalStatus`, `ToolQuestion`, `ToolQuestionAnswer`, `ToolQuestionAnswerInput`, `ToolQuestionChoice`, `ToolQuestionPrompt`, and `ToolQuestionStatus`.

## Resume and memory helpers

```ts
type ChatResumeOptions = {
  key: string
  storage?: 'sessionStorage' | 'localStorage' | Storage
  auto?: boolean
}

type ChatResumeState = {
  version: 1
  streamId: string
  lastEventId: number
  messages: UIMessage[]
}
```

`ChatResumeCursor` aliases `UIStreamResume`. `ResumableStreamEnvelope<TEvent>` mirrors the server envelope union used by resumable routes.

```ts
function initialMessagesFromMemory(
  messages: Message[],
  options?: {
    includeCompactionSummaries?: boolean
  },
): UIMessage[]
```

Converts Core memory messages into UI state. Compaction summaries are excluded unless requested.

## Export catalog

| Group | Symbols |
| --- | --- |
| Hooks | `useChat`, `useCompletion`, `useSmoothStreamText`, `useSmoothStreamItems` |
| Transport | `createChatTransport`, `createFetchTransport`, `createDirectTransport`, `fetchEventStream`, `readJsonlStream`, `readSseStream`, `EventStreamHttpError` |
| Human input | `defaultEventToApproval`, `defaultEventToQuestion`, `defaultDecideApproval`, `defaultAnswerQuestion` |
| Memory | `initialMessagesFromMemory` |
| Chat types | `UseChatOptions`, `UseChatResult`, `UseChatStatus`, `CreateChatRequestArgs`, `SendMessageInput`, `ChatSuggestion`, `InitialMessagesFromMemoryOptions` |
| Completion types | `UseCompletionOptions`, `UseCompletionResult`, `UseCompletionStatus`, `UseCompletionRequestArgs` |
| Transport types | `EventTransport`, `EventStreamFormat`, `TransportOptions`, `CreateFetchTransportOptions`, `FetchEventStreamOptions` |
| Smoothing types | `StreamSmoothingLifecycle`, `SmoothStreamItemAdapter`, `UseSmoothStreamTextOptions`, `UseSmoothStreamTextResult`, `UseSmoothStreamItemsOptions`, `UseSmoothStreamItemsResult` |
| Resume types | `ChatResumeCursor`, `ChatResumeOptions`, `ChatResumeState`, `ChatResumeStorage`, `ResumableStreamEnvelope` |
| UI types re-exported from Core | `CreateUIAttachment`, `UIAttachment`, `UIError`, `UIMessage`, `UIMessagePart`, `UIMessageRole`, `UIStreamEvent`, `UIStreamRequest`, `UIStreamResume` |

Return to the [`@anvia/react` overview](/packages/react).
