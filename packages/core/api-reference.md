# `@anvia/core` API reference

`@anvia/core` has a convenience root entry point and capability-specific subpaths. This page catalogs the public symbols from every package export and gives full declarations for the primary construction and execution APIs.

No public export is currently annotated as deprecated or experimental. The `@anvia/core/internal/agent` path is exported by the package, but its name identifies it as a lower-level implementation surface; prefer `@anvia/core/agent` for application code.

## `@anvia/core`

The root exports the most common runtime APIs. Symbols with fuller capability-specific surfaces are documented again under their subpath.

| Group | Symbols |
| --- | --- |
| Agent | `AgentBuilder` |
| Completion functions | `createCompletion`, `createCompletionStream`, `createParsedCompletion`, `calculateContextUsage`, `getAssistantGenerationMetadata`, `resolveCompletionModelInfo`, `withContextUsage`, `isJsonValue`, `isProviderTool` |
| Completion values | `AssistantContent`, `Message`, `ToolContent`, `Usage`, `UserContent` |
| Completion types | `AssistantGenerationMetadata`, `AssistantMessage`, `AssistantMessageOptions`, `CompletionModel`, `CompletionModelInfo`, `CompletionModelMetadataOptions`, `CompletionRequest`, `CompletionResponse`, `CompletionSource`, `CompletionTool`, `ContextUsage`, `CreateCompletionBaseOptions`, `CreateCompletionInput`, `CreateCompletionOptions`, `CreateCompletionResult`, `CreateCompletionStreamOptions`, `CreateParsedCompletionOptions`, `CreateParsedCompletionResult`, `Document`, `ImageContent`, `JsonObject`, `JsonPrimitive`, `JsonValue`, `MessageOptions`, `ModelContextLimits`, `ProviderTool`, `ProviderToolCall`, `SystemMessage`, `Text`, `ToolCall`, `ToolDefinition`, `ToolMessage`, `ToolResult`, `ToolResultContent`, `ToolResultMessageOptions`, `ToolResultOptions`, `UserMessage` |
| Guardrails | `allow`, `block`, `defineGuardrailPolicy`, `defineInputGuardrail`, `defineOutputGuardrail`, `guardrails`, `GuardrailBoundary`, `GuardrailDecisionRecord`, `GuardrailMode`, `GuardrailPolicy`, `GuardrailPolicyInput`, `GuardrailPolicyOptions`, `InputGuardrail`, `InputGuardrailActions`, `InputGuardrailContext`, `OutputGuardrail`, `OutputGuardrailActions`, `OutputGuardrailContext` |
| Hooks and control | `cancelPrompt`, `createHook`, `requestToolApproval`, `runControl`, `skipTool`, `toolCallControl` |
| Memory | `createSummaryMemoryCompactor`, `isMemoryCompactionSummary`, `MemoryCompactionConflictError`, `MemoryCompactionError`, `MemoryCompactionCommitInput`, `MemoryCompactionCommitResult`, `MemoryCompactionOptions`, `MemoryCompactionSnapshot`, `MemoryCompactionStore`, `MemoryCompactor`, `MemoryCompactorInput`, `MemoryCompactorResult`, `MemoryConversation`, `MemoryConversationListOptions`, `MemoryConversationMessage`, `MemoryConversationSummary`, `MemoryInspector`, `MemoryStore`, `ResolvedMemoryCompactionOptions`, `SummaryMemoryCompactorOptions` |
| Request | `MaxTurnsError`, `PromptCancelledError`, `ToolApprovalRequiredError`, `CompletionRetryContext`, `CompletionRetryOptions`, `AgentChildStreamEvent`, `AgentChildStreamEventWithoutToolCallDeltas`, `AgentChildStreamEventWithToolCallDeltas`, `AgentErrorStreamEvent`, `AgentStreamEvent`, `AgentStreamEventWithoutToolCallDeltas`, `AgentStreamEventWithToolCallDeltas`, `AgentStreamOptions`, `AgentToolCallDeltaEvent`, `PromptResponse` |
| Skills | `loadSkills`, `skill`, `SkillValidationError` |
| Tools | `createTool`, `createThinkTool`, `AnyTool`, `CreateToolOptions`, `Tool`, `ToolApprovalContext`, `ToolApprovalDecision`, `ToolApprovalPolicy`, `ToolApprovalRequest`, `ToolApprovalsOptions`, `ToolCallContext`, `ToolCallStreamEvent` |
| Middleware | `createMiddleware`, `AgentMiddleware`, `CompletionRequestMiddlewareArgs`, `CompletionRequestMiddlewareResult`, `CompletionResponseMiddlewareArgs`, `CompletionResponseMiddlewareResult`, `ToolInputMiddlewareArgs`, `ToolInputMiddlewareResult`, `ToolOutputMiddlewareArgs`, `ToolOutputMiddlewareResult`, `ToolResultMiddlewareArgs` |
| UI stream | `coreMessagesToUIMessages`, `uiMessagesToCoreMessages`, `CreateUIAttachment`, `UIAttachment`, `UIError`, `UIMessage`, `UIMessagePart`, `UIMessageRole`, `UIStreamEvent`, `UIStreamRequest`, `UIStreamResume` |
| Schema | `ZodSchema` |

## `@anvia/core/agent`

```ts
import { AgentBuilder, type Agent } from '@anvia/core/agent'
```

### `AgentBuilder`

```ts
class AgentBuilder<M extends CompletionModel = CompletionModel> {
  constructor(agentId: string, completionModel: M)

  name(name: string): this
  description(description: string): this
  instructions(instructions: string): this
  context(text: string, id?: string): this
  dynamicContext<T>(
    index: VectorSearchIndex<T>,
    options: DynamicContextOptions<T>,
  ): this
  dynamicTools(
    index: VectorSearchIndex<ToolSearchDocument>,
    options: DynamicToolOptions,
  ): this
  tool(tool: AnyTool | ProviderTool): this
  tools(tools: Array<AnyTool | ProviderTool>): this
  mcp(servers: McpServer[]): this
  skills(skillSet: SkillSet): this
  useToolSet(toolSet: ToolSet): this
  temperature(temperature: number): this
  maxTokens(maxTokens: number): this
  additionalParams(params: JsonValue): this
  toolChoice(toolChoice: ToolChoice): this
  defaultMaxTurns(defaultMaxTurns: number): this
  hook(hook: PromptHook): this
  middleware(middleware: AgentMiddleware): this
  middlewares(middlewares: AgentMiddleware[]): this
  observe(observer: AgentObserver, options?: ObserveOptions): this
  approvals(options: ToolApprovalsOptions): this
  guardrails(policies: GuardrailPolicyInput): this
  memory(store: MemoryStore, options?: MemoryOptions): this
  eventStore(
    store: AgentEventStore,
    options?: AgentEventStoreOptions,
  ): this
  outputSchema(schema: ZodSchema): this
  build(): Agent<M>
}
```

The constructor fixes the stable agent ID and completion model. Builder methods accumulate configuration and return `this`; `build` returns an immutable runtime-facing `Agent`.

An `Agent` creates prompt requests and sessions. A session carries its memory context so repeated prompts use the same stored conversation.

### Export catalog

`Agent`, `AgentBuilder`, `AgentSession`, `AgentEventAppendInput`, `AgentEventRecord`, `AgentEventStore`, `AgentEventStoreInclude`, `AgentEventStoreOptions`, `AgentToolOptions`, `DynamicContextOptions`, and `DynamicToolOptions`.

## `@anvia/core/internal/agent`

This exported lower-level entry point contains `Agent`, `AgentEventAppendInput`, `AgentEventRecord`, `AgentEventStore`, `AgentEventStoreInclude`, `AgentEventStoreOptions`, `AgentEventStoreRegistration`, `AgentOptions`, `AgentSession`, `AgentToolOptions`, `DEFAULT_MAX_TURNS`, `DynamicContextOptions`, `DynamicContextRegistration`, `DynamicToolOptions`, and `DynamicToolRegistration`.

Application code normally imports the builder and public contracts from `@anvia/core/agent` instead.

## `@anvia/core/completion`

### Direct completion functions

```ts
type CreateCompletionInput = string | Message | Message[]

type CreateCompletionBaseOptions = {
  input?: CreateCompletionInput
  messages?: Message[]
  instructions?: string
  documents?: Document[]
  tools?: CompletionTool[]
  temperature?: number
  maxTokens?: number
  toolChoice?: ToolChoice
  outputSchema?: JsonObject
  params?: JsonValue
}

function createCompletion<Model extends CompletionModel>(
  model: Model,
  options: CreateCompletionOptions,
): Promise<CreateCompletionResult<RawResponseOf<Model>>>

function createCompletionStream<Model extends StreamingCompletionModel>(
  model: Model,
  options: CreateCompletionStreamOptions,
): AsyncIterable<CompletionStreamEvent<RawResponseOf<Model>>>

function createParsedCompletion<T, Model extends CompletionModel>(
  model: Model,
  options: Omit<CreateCompletionBaseOptions, 'outputSchema'> & {
    schema: ZodSchema<T>
  },
): Promise<CreateParsedCompletionResult<T, RawResponseOf<Model>>>
```

`input` is appended after `messages` when both are present. Parsed completions validate the final model output with the supplied schema.

```ts
type CreateCompletionResult<RawResponse = unknown> = {
  text: string
  content: AssistantContent[]
  usage: Usage
  response: CompletionResponse<RawResponse>
}

type CreateParsedCompletionResult<T, RawResponse = unknown> =
  CreateCompletionResult<RawResponse> & {
    data: T
  }
```

### Request builder

```ts
class CompletionRequestBuilder<M extends CompletionModel = CompletionModel> {
  constructor(model: M)
  input(input: string | Message | Message[]): this
  messages(messages: Message[]): this
  instructions(instructions: string): this
  documents(documents: Document[]): this
  tools(tools: CompletionTool[]): this
  temperature(temperature: number): this
  maxTokens(maxTokens: number): this
  toolChoice(toolChoice: ToolChoice): this
  additionalParams(additionalParams: JsonValue | undefined): this
  outputSchema(outputSchema: JsonObject | undefined): this
  build(): CompletionRequest<ModelNameOf<M>>
  send(): Promise<CompletionResponse<RawResponseOf<M>>>
}
```

### Messages and model contracts

`Message` is a discriminated union of `SystemMessage`, `UserMessage`, `AssistantMessage`, and `ToolMessage`. The `Message` value provides constructors for those roles. `UserContent`, `AssistantContent`, and `ToolContent` are both content contracts and constructor/helper values where exported as values.

`CompletionModel` defines `completion(request)`. `StreamingCompletionModel` adds `completionStream(request)`. Provider packages implement these interfaces; `CompletionModelCapabilities` and `assertCompletionRequestSupported` make optional model support explicit.

### Export catalog

| Group | Symbols |
| --- | --- |
| Functions | `createCompletion`, `createCompletionStream`, `createParsedCompletion`, `isStreamingCompletionModel`, `isJsonValue`, `formatDocument`, `normalizeDocuments`, `isProviderTool`, `isToolResultContentArray`, `serializeToolResultOutput`, `reasoningDisplayText`, `textFromAssistantContent`, `calculateContextUsage`, `getAssistantGenerationMetadata`, `resolveCompletionModelInfo`, `withContextUsage`, `assertCompletionRequestSupported` |
| Classes and values | `CompletionRequestBuilder`, `CompletionCapabilityError`, `Message`, `UserContent`, `AssistantContent`, `ToolContent`, `Usage` |
| Request/result types | `CreateCompletionInput`, `CreateCompletionBaseOptions`, `CreateCompletionOptions`, `CreateCompletionStreamOptions`, `CreateParsedCompletionOptions`, `CreateCompletionResult`, `CreateParsedCompletionResult`, `CompletionRequest`, `CompletionResponse`, `CompletionStreamEvent` |
| Model types | `CompletionModel`, `StreamingCompletionModel`, `CompletionModelCapabilities`, `CompletionModelInfo`, `CompletionModelMetadataOptions`, `ModelContextLimits` |
| Message types | `Message`, `SystemMessage`, `UserMessage`, `AssistantMessage`, `ToolMessage`, `MessageOptions`, `AssistantMessageOptions`, `Text`, `ImageContent`, `ImageDetail`, `DocumentContent`, `Document`, `Reasoning`, `ReasoningContent`, `ReasoningContentType` |
| Tool content | `CompletionTool`, `ToolDefinition`, `ToolFunction`, `ProviderTool`, `ProviderToolCall`, `ToolChoice`, `ToolCall`, `ToolCallArgumentsMode`, `ToolResult`, `ToolResultContent`, `ToolResultOptions`, `ToolResultMessageOptions` |
| JSON and metadata | `JsonPrimitive`, `JsonValue`, `JsonObject`, `AssistantGenerationMetadata`, `CompletionSource`, `Usage`, `UsageDetails`, `ContextUsage` |

## `@anvia/core/request`

### `PromptRequest`

```ts
class PromptRequest<M extends CompletionModel = CompletionModel> {
  static fromAgent<M extends CompletionModel>(
    agent: Agent<M>,
    prompt: string | Message | Message[],
    options?: { memoryContext?: MemoryContext },
  ): PromptRequest<M>

  maxTurns(maxTurns: number): this
  withCompletionRetries(options?: CompletionRetryOptions): this
  withHook(hook: PromptHook): this
  approvals(options: ToolApprovalsOptions): this
  guardrails(policies: GuardrailPolicyInput): this
  withToolConcurrency(concurrency: number): this
  withMiddleware(middleware: AgentMiddleware): this
  withMiddlewares(middlewares: AgentMiddleware[]): this
  withTrace(trace: AgentTraceOptions): this
  steer(input: string | Message | Message[]): boolean
  send(): Promise<PromptResponse>
  stream(options?: AgentStreamOptions): AsyncIterable<AgentStreamEvent>
  readableStream(options?: AgentStreamOptions): ReadableStream<Uint8Array>
}
```

`send` resolves the final response. `stream` yields semantic agent events; set `includeToolCallDeltas: false` for the narrower event union. `readableStream` encodes those events as JSONL bytes. `steer` returns whether the message was accepted by the active run.

The entry point exports `PromptRequest`, `MaxTurnsError`, `PromptCancelledError`, `ToolApprovalRequiredError`, `CompletionRetryContext`, `CompletionRetryOptions`, `PromptResponse`, `AgentDeltaEvent`, `AgentErrorStreamEvent`, `AgentToolCallDeltaEvent`, `AgentChildStreamEvent`, `AgentChildStreamEventWithToolCallDeltas`, `AgentChildStreamEventWithoutToolCallDeltas`, `AgentStreamEvent`, `AgentStreamEventWithToolCallDeltas`, `AgentStreamEventWithoutToolCallDeltas`, and `AgentStreamOptions`.

## `@anvia/core/tool`

### `createTool`

```ts
type CreateToolOptions<
  InputSchema extends ZodSchema,
  OutputSchema extends ZodSchema | undefined = undefined,
  Output = unknown,
> = {
  name: string
  description: string
  input: InputSchema
  output?: OutputSchema
  approval?: ToolApprovalPolicy<z.output<InputSchema>>
  execute(
    args: z.output<InputSchema>,
    context: ToolCallContext,
  ): OutputSchema extends ZodSchema
    ? z.input<OutputSchema> | Promise<z.input<OutputSchema>>
    : Output | Promise<Output>
}

function createTool<InputSchema extends ZodSchema, Output = unknown>(
  options: CreateToolOptions<InputSchema, undefined, Output> & {
    output?: undefined
  },
): Tool<z.output<InputSchema>, Output>

function createTool<
  InputSchema extends ZodSchema,
  OutputSchema extends ZodSchema,
>(
  options: CreateToolOptions<InputSchema, OutputSchema>,
): Tool<z.output<InputSchema>, z.output<OutputSchema>>
```

The input schema validates model arguments before `execute`. When an output schema is supplied, the returned tool output is validated and typed from that schema.

```ts
interface Tool<Args = unknown, Output = unknown> {
  readonly name: string
  readonly approval?: ToolApprovalPolicy<Args>
  definition(prompt: string): ToolDefinition | Promise<ToolDefinition>
  call(args: Args, context?: ToolCallContext): Output | Promise<Output>
  parseApprovalArgs?(args: unknown): Args
}
```

### Dynamic discovery and middleware

```ts
function createToolIndex<Metadata extends VectorMetadata = VectorMetadata>(
  model: EmbeddingModel,
  tools: AnyTool[] | ToolSet,
  options?: EmbedToolsOptions<Metadata>,
): Promise<DynamicToolIndex<Metadata>>

function embedTools<Metadata extends VectorMetadata = VectorMetadata>(
  model: EmbeddingModel,
  tools: AnyTool[] | ToolSet,
  options?: EmbedToolsOptions<Metadata>,
): Promise<Array<EmbeddedDocument<ToolSearchDocument<Metadata>, Metadata>>>

function isDynamicToolIndex(value: unknown): value is DynamicToolIndex
```

`createMiddleware` preserves the middleware type while exposing completion-request, completion-response, tool-input, and tool-output interception contracts.

### Export catalog

| Group | Symbols |
| --- | --- |
| Creation | `createTool`, `CreateToolOptions`, `createThinkTool`, `CreateThinkToolOptions` |
| Contracts | `Tool`, `AnyTool`, `ToolCallContext`, `ToolCallStreamEvent`, `ToolOutput`, `NormalizedToolOutput` |
| Approvals | `ToolApprovalRunContext`, `ToolApprovalContext`, `ToolApprovalPolicy`, `ToolApprovalRequest`, `ToolApprovalDecision`, `ToolApprovalsOptions` |
| Result helpers | `normalizeToolResultOutput`, `toolResultContentToText`, `serializeToolOutput`, `isToolResultContentArray`, `parseToolArgs` |
| Sets and discovery | `ToolSet`, `ToolSearchDocument`, `DynamicToolIndex`, `EmbedToolsOptions`, `createToolIndex`, `embedTools`, `isDynamicToolIndex` |
| Middleware | `createMiddleware`, `AgentMiddleware`, `CompletionRequestMiddlewareArgs`, `CompletionRequestMiddlewareResult`, `CompletionResponseMiddlewareArgs`, `CompletionResponseMiddlewareResult`, `ToolInputMiddlewareArgs`, `ToolInputMiddlewareResult`, `ToolOutputMiddlewareArgs`, `ToolOutputMiddlewareResult`, `ToolResultMiddlewareArgs` |
| Errors | `ToolCallError`, `ToolNotFoundError`, `ToolJsonError` |

## `@anvia/core/hooks`

```ts
function createHook<RawResponse = unknown>(
  hook: PromptHook<RawResponse>,
): PromptHook<RawResponse>

function cancelPrompt(reason: string): HookAction
function skipTool(reason: string): ToolCallHookAction
function requestToolApproval(
  options?: ToolApprovalRequestOptions,
): ToolCallHookAction
```

`runControl` and `toolCallControl` provide the same typed control actions as reusable objects.

The entry point exports `PromptHook`, `HookAction`, `HookResult`, `RunControl`, `ToolCallControl`, `ToolCallHookAction`, `ToolApprovalRequestOptions`, `CompletionCallHookArgs`, `CompletionResponseHookArgs`, `CompletionErrorHookArgs`, `RunStartHookArgs`, `RunEndHookArgs`, `RunErrorHookArgs`, `TurnStartHookArgs`, `TurnEndHookArgs`, `ToolHookArgs`, `ToolCallHookArgs`, `ToolCallHookResult`, `ToolResultHookArgs`, and `ToolErrorHookArgs`, plus the functions and control objects above.

## `@anvia/core/guardrails`

```ts
function defineGuardrailPolicy(
  options: GuardrailPolicyOptions,
): GuardrailPolicy

function defineInputGuardrail(
  guardrail: InputGuardrail,
): InputGuardrail

function defineOutputGuardrail(
  guardrail: OutputGuardrail,
): OutputGuardrail
```

The definition helpers preserve the typed callbacks. `allow` and `block` build common decisions; rewrite decisions are supplied through boundary-specific action objects. `guardrails` contains the built-in `blockText` and `redactText` factories.

Exported functions and values are `allow`, `block`, `defineGuardrailPolicy`, `defineInputGuardrail`, `defineOutputGuardrail`, `guardrails`, `appendGuardrailPolicies`, `normalizeGuardrailPolicies`, `hasEnforcedOutputGuardrails`, `runInputGuardrails`, and `runOutputGuardrails`.

Exported types are `GuardrailActionBase`, `GuardrailActionName`, `GuardrailAllow`, `GuardrailBlock`, `GuardrailBoundary`, `GuardrailCommonActions`, `GuardrailDecisionRecord`, `GuardrailMode`, `GuardrailPolicy`, `GuardrailPolicyInput`, `GuardrailPolicyOptions`, `GuardrailRunContext`, `InputGuardrail`, `InputGuardrailActions`, `InputGuardrailContext`, `InputGuardrailResult`, `InputGuardrailRewrite`, `InputGuardrailRunResult`, `OutputGuardrail`, `OutputGuardrailActions`, `OutputGuardrailContext`, `OutputGuardrailResult`, `OutputGuardrailRewrite`, and `OutputGuardrailRunResult`.

## `@anvia/core/memory`

```ts
interface MemoryStore {
  readonly inspector?: MemoryInspector
  readonly compaction?: MemoryCompactionStore
  load(context: MemoryContext): Promise<Message[]>
  append(input: MemoryAppendInput): Promise<void>
  clear(context: MemoryContext): Promise<void>
  recordError?(input: MemoryErrorInput): Promise<void>
}
```

`MemoryStore` is the agent's read/write conversation boundary. Optional inspector and compaction interfaces add discovery and safe summary commits.

```ts
function resolveMemoryOptions(
  options?: MemoryOptions,
): ResolvedMemoryOptions

function createSummaryMemoryCompactor(
  options: SummaryMemoryCompactorOptions,
): MemoryCompactor

function isMemoryCompactionSummary(
  message: Message,
): boolean
```

Exported errors are `MemoryCompactionError` and `MemoryCompactionConflictError`.

The complete type catalog is `MemoryStore`, `MemoryInspector`, `MemoryRegistration`, `MemoryContext`, `MemoryAppendInput`, `MemoryErrorInput`, `MemoryOptions`, `ResolvedMemoryOptions`, `SessionOptions`, `MemorySavePolicy`, `MemoryConversation`, `MemoryConversationListOptions`, `MemoryConversationMessage`, `MemoryConversationSummary`, `MemoryCompactor`, `MemoryCompactorInput`, `MemoryCompactorResult`, `MemoryCompactionOptions`, `ResolvedMemoryCompactionOptions`, `MemoryCompactionSnapshot`, `MemoryCompactionStore`, `MemoryCompactionCommitInput`, `MemoryCompactionCommitResult`, and `SummaryMemoryCompactorOptions`.

## `@anvia/core/embeddings`

```ts
function embedText(
  model: EmbeddingModel,
  text: string,
): Promise<Embedding>

function embedTexts(
  model: EmbeddingModel,
  texts: string[],
): Promise<Embedding[]>

function embedDocuments<T, Metadata extends VectorMetadata = VectorMetadata>(
  model: EmbeddingModel,
  documents: T[],
  options: EmbedDocumentsOptions<T, Metadata>,
): Promise<Array<EmbeddedDocument<T, Metadata>>>
```

Sparse and hybrid equivalents are `embedSparseQuery`, `embedSparseTexts`, and `embedHybridDocuments`.

The distance helpers are `dotProduct`, `cosineSimilarity`, `angularDistance`, `euclideanDistance`, `manhattanDistance`, and `chebyshevDistance`.

Types: `Embedding`, `EmbeddingModel`, `SparseEmbedding`, `SparseEmbeddingModel`, `SparseVector`, `EmbeddedDocument`, `EmbedDocumentsOptions`, `EmbedHybridDocumentsOptions`, `VectorMetadata`, and `VectorMetadataValue`.

## `@anvia/core/vector-store`

```ts
class InMemoryVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  constructor(options?: { index?: IndexStrategy })
  static fromDocuments<T, Metadata extends VectorMetadata = VectorMetadata>(
    documents: Array<EmbeddedDocument<T, Metadata>>,
    options?: { index?: IndexStrategy },
  ): InMemoryVectorStore<T, Metadata>
  addDocuments(documents: Array<EmbeddedDocument<T, Metadata>>): this
  get(id: string): EmbeddedDocument<T, Metadata> | undefined
  values(): Array<EmbeddedDocument<T, Metadata>>
  len(): number
  isEmpty(): boolean
  index(model: EmbeddingModel): InMemoryVectorIndex<T, Metadata>
}

function createVectorSearchTool<T, Metadata extends VectorMetadata>(
  index: VectorSearchIndex<T, Metadata>,
  options: VectorSearchToolOptions,
): Tool<
  { query: string; topK?: number },
  Array<VectorSearchResult<T, Metadata>>
>
```

`InMemoryVectorIndex` implements `search`, `searchIds`, `inspect`, and `asTool` over an in-memory store. `vectorFilter` builds metadata filter expressions.

The entry point exports `InMemoryVectorStore`, `InMemoryVectorIndex`, `createVectorSearchTool`, `vectorFilter`, `IndexStrategy`, `LshOptions`, `VectorFilter`, `VectorInspectItem`, `VectorInspectPage`, `VectorInspectRequest`, `VectorSearchIndex`, `VectorSearchRequest`, `VectorSearchResult`, and `VectorSearchToolOptions`.

## `@anvia/core/loaders`

`FileLoader` and `PdfFileLoader` are async-iterable loaders. Their fluent options control file mode, page splitting, and whether per-source errors are returned instead of thrown.

Conversion functions are `fileToDocument`, `fileLoaderToDocuments`, `pdfToDocument`, `pdfPageToDocument`, `pdfLoaderToDocuments`, and `pdfPageLoaderToDocuments`.

Types: `FileMode`, `FileSource`, `FileReadWithPath`, `PdfSource`, `PdfPage`, `PdfPageWithPath`, `PdfReadWithPath`, `LoaderResult`, `LoaderValue`, and `UnwrapLoaderResult`.

## `@anvia/core/extractor`

```ts
class ExtractorBuilder<T, M extends CompletionModel = CompletionModel> {
  constructor(model: M, schema: ZodSchema<T>)
  instructions(instructions: string): this
  context(text: string, id?: string): this
  temperature(temperature: number): this
  maxTokens(maxTokens: number): this
  additionalParams(params: JsonValue): this
  toolChoice(toolChoice: ToolChoice): this
  retries(retries: number): this
  build(): Extractor<T, M>
}

class Extractor<T, M extends CompletionModel = CompletionModel> {
  extract(text: string | Message): Promise<T>
  extractWithUsage(text: string | Message): Promise<ExtractionResponse<T>>
  extractWithHistory(text: string | Message, history: Message[]): Promise<T>
  getInner(): Agent<M>
}
```

The entry point also exports `ExtractionResponse` and `ExtractionError`.

## `@anvia/core/pipeline`

```ts
interface PipelineOp<Input = unknown, Output = unknown> {
  run(input: Input): Output | Promise<Output>
}

class PipelineBuilder<Input, Output = Input> {
  constructor(schema: z.ZodType<Output, Input>, metadata?: PipelineMetadata)
  constructor(executor: (input: Input) => Output | Promise<Output>)

  step<Next>(
    fn: (input: Awaited<Output>) => Next | Promise<Next>,
    metadata?: PipelineStageMetadata,
  ): PipelineBuilder<Input, Awaited<Next>>
  use<Next>(
    op: PipelineOp<Awaited<Output>, Next>,
    metadata?: PipelineStageMetadata,
  ): PipelineBuilder<Input, Awaited<Next>>
  parallel<Branches extends Record<string, PipelineOp<Awaited<Output>, unknown>>>(
    branches: Branches,
    metadata?: PipelineStageMetadata,
  ): PipelineBuilder<Input, ParallelOutput<Branches>>
  prompt(
    agent: Agent<CompletionModel>,
    metadata?: PipelineStageMetadata,
  ): PipelineBuilder<Input, string>
  extract<T>(
    extractor: Extractor<T, CompletionModel>,
    metadata?: PipelineStageMetadata,
  ): PipelineBuilder<Input, T>
  build(): Pipeline<Input, Awaited<Output>>
}
```

```ts
class Pipeline<Input, Output> implements PipelineOp<Input, Awaited<Output>> {
  readonly id: string
  readonly name: string | undefined
  readonly description: string | undefined
  readonly metadata: JsonObject | undefined
  run(input: Input, options?: PipelineRunOptions): Promise<Awaited<Output>>
  batch<I extends Iterable<Input>>(
    inputs: I,
    options: { concurrency: number },
  ): Promise<Array<Awaited<Output>>>
  graph(): PipelineGraph
}
```

The remaining graph and observer types are `PipelineGraph`, `PipelineGraphNode`, `PipelineGraphEdge`, `PipelineMetadata`, `PipelineStageMetadata`, `PipelineStageKind`, `PipelineRunEvent`, `PipelineRunObserver`, `PipelineRunOptions`, and `PipelineBatchOptions`.

## Media entry points

### `@anvia/core/image-generation`

```ts
function imageGenerationRequest<Model extends ImageGenerationModel>(
  model: Model,
): ImageGenerationRequestBuilder<Model>
```

The builder exposes `prompt`, `width`, `height`, `additionalParams`, `build`, and `send`. Exports: `imageGenerationRequest`, `ImageGenerationRequestBuilder`, `ImageGenerationModel`, `ImageGenerationRequest`, `ImageGenerationResponse`, and `GeneratedImage`.

### `@anvia/core/audio-generation`

```ts
function audioGenerationRequest<Model extends AudioGenerationModel>(
  model: Model,
): AudioGenerationRequestBuilder<Model>
```

The builder exposes `text`, `voice`, `speed`, `additionalParams`, `build`, and `send`. Exports: `audioGenerationRequest`, `AudioGenerationRequestBuilder`, `AudioGenerationModel`, `AudioGenerationRequest`, and `AudioGenerationResponse`.

### `@anvia/core/transcription`

```ts
function transcriptionRequest<Model extends TranscriptionModel>(
  model: Model,
): TranscriptionRequestBuilder<Model>
```

The builder exposes `data`, `filename`, `language`, `prompt`, `temperature`, `additionalParams`, `build`, and `send`. Exports: `transcriptionRequest`, `TranscriptionRequestBuilder`, `TranscriptionModel`, `TranscriptionRequest`, and `TranscriptionResponse`.

## `@anvia/core/mcp`

```ts
const mcp: {
  stdio(options: McpStdioOptions): McpConnection
  http(options: McpHttpOptions): McpConnection
  sse(options: McpSseOptions): McpConnection
}

function connectMcp(connection: McpConnection): Promise<McpServer>
```

The entry point exports `mcp`, `connectMcp`, `McpConnection`, `McpServer`, `McpClient`, `McpStdioOptions`, `McpHttpOptions`, `McpSseOptions`, `McpToolDefinition`, `McpToolCallContent`, and `McpToolCallResult`.

## `@anvia/core/skills`

```ts
function loadSkills(loaders: SkillLoader | SkillLoader[]): Promise<SkillSet>

const skill: {
  local(path: string): SkillLoader
}
```

Exports: `loadSkills`, `skill`, `Skill`, `SkillLoader`, `SkillSet`, `SkillValidationError`, and `SkillValidationIssue`.

## `@anvia/core/observability`

```ts
function createObserver(options: AgentObserver): AgentObserver
```

`createObserver` preserves the composite observer type. Exported contracts are `AgentObserver`, `AgentObserverRegistration`, `ObserveOptions`, `AgentTraceInfo`, `AgentTraceOptions`, `AgentRunObserver`, `AgentRunPromptRef`, `AgentRunEventArgs`, `AgentRunStartArgs`, `AgentRunEndArgs`, `AgentRunErrorArgs`, `AgentGenerationObserver`, `AgentGenerationModelInfo`, `AgentGenerationStartArgs`, `AgentGenerationUpdateArgs`, `AgentGenerationEndArgs`, `AgentGenerationErrorArgs`, `AgentToolObserver`, `AgentToolStartArgs`, `AgentToolStreamEventArgs`, `AgentToolEndArgs`, and `AgentToolErrorArgs`.

## `@anvia/core/evals`

### Primary suite APIs

```ts
function defineEvalSuite<Input, Output, Expected = unknown>():
  EvalSuiteTypeBuilder<Input, Output, Expected>

function defineMetric<
  Input,
  Output,
  Score,
  Expected,
  const Name extends string = string,
>(
  metric: EvalMetric<Input, Output, Score, Expected, Name>,
): EvalMetric<Input, Output, Score, Expected, Name>

function runEvalSuite<
  Input,
  Output,
  Expected = unknown,
  const Metrics extends readonly EvalMetric<
    NoInfer<Input>,
    NoInfer<Output>,
    unknown,
    NoInfer<Expected>,
    string
  >[] = readonly EvalMetric<
    NoInfer<Input>,
    NoInfer<Output>,
    unknown,
    NoInfer<Expected>,
    string
  >[],
>(
  options: RunEvalSuiteOptions<Input, Output, Expected, Metrics>,
): Promise<EvalSuiteResult<Input, Output, Expected, Metrics>>
```

`defineEvalCases` preserves literal case input and expected types. `agentEvalTarget` adapts an agent to an evaluation target. `runEvalCli`, `printEvalResult`, and `evalExitCode` provide command-line execution and output.

### Metric factories

`abstention`, `answerRelevancy`, `contains`, `containsAll`, `containsAny`, `doesNotMatch`, `exactMatch`, `faithfulness`, `gEval`, `hallucination`, `jsonCorrectness`, `knowledgeRetention`, `llmJudge`, `llmScore`, `matches`, `maxLength`, `notContains`, `promptAlignment`, `requiredFields`, `semanticSimilarity`, `summarization`, and `turnRelevancy`.

### Result and trace helpers

`EvalOutcome`, `EvalAssertionError`, `assertEvalOutcomes`, `assertEvalTotals`, `defaultEvalTraceSelector`, `projectEvalOutcome`, `resolveEvalTraceRef`, and `selectPromptOutput`.

### Complete type catalog

`AbstentionCategory`, `AbstentionOptions`, `AgentEvalTargetOptions`, `AnswerRelevancyOptions`, `AnyEvalMetric`, `ContainsAllOptions`, `ContainsAnyOptions`, `ContainsListOptions`, `ContainsOptions`, `DefaultEvalActual`, `DefinedEvalSuite`, `DoesNotMatchOptions`, `EvalCase`, `EvalCaseRequirements`, `EvalCaseResult`, `EvalCasesExpected`, `EvalCasesForMetrics`, `EvalCasesInput`, `EvalCostCalculatorArgs`, `EvalCostOptions`, `EvalCostSummary`, `EvalDataType`, `EvalExpectations`, `EvalExpectedOutcomes`, `EvalExpectedTotals`, `EvalMetadata`, `EvalMetric`, `EvalMetricArgs`, `EvalMetricDescriptor`, `EvalMetricResult`, `EvalMetricResultFor`, `EvalMetricScore`, `EvalOutcomeStatus`, `EvalOutputFormat`, `EvalOutputWriters`, `EvalReportArgs`, `EvalReporter`, `EvalRunContext`, `EvalRunEndArgs`, `EvalRunOptions`, `EvalRunStartArgs`, `EvalScoreDirection`, `EvalScoreMap`, `EvalScoreProjection`, `EvalSuiteResult`, `EvalSuiteTypeBuilder`, `EvalTarget`, `EvalTargetUsageSelector`, `EvalTotals`, `EvalTraceCarrier`, `EvalTraceRef`, `EvalTraceSelector`, `EvalTraceSelectorArgs`, `EvalTurn`, `EvalUsageSummary`, `ExactMatchOptions`, `FaithfulnessOptions`, `GEvalOptions`, `GEvalParameter`, `GEvalRubric`, `HallucinationOptions`, `JsonCorrectnessOptions`, `KnowledgeRetentionOptions`, `LlmJudgeOptions`, `LlmScoreMetricScore`, `LlmScoreOptions`, `MatchesOptions`, `MaxLengthOptions`, `NotContainsOptions`, `PrintEvalResultOptions`, `PromptAlignmentOptions`, `RequiredFieldsOptions`, `RunEvalCliOptions`, `RunEvalSuiteOptions`, `SelectorOrValue`, `SemanticSimilarityOptions`, `SummarizationOptions`, `TurnRelevancyOptions`, and `ValueSelector`.

## `@anvia/core/model-listing`

```ts
interface ModelListingClient {
  listModels(): Promise<ModelList>
}

type ModelList = {
  data: ListedModel[]
}
```

Exports: `ModelListingClient`, `ModelList`, `ListedModel`, `ModelId`, and `ModelListingError`.

## `@anvia/core/streaming`

```ts
type ReadableStreamOptions = {
  format?: 'jsonl'
}

function toReadableStream<T>(
  events: AsyncIterable<T>,
  options?: ReadableStreamOptions,
): ReadableStream<Uint8Array>
```

The function JSONL-encodes each event into a Web `ReadableStream`.

## `@anvia/core/ui`

```ts
function uiMessagesToCoreMessages(messages: UIMessage[]): Message[]
function coreMessagesToUIMessages(messages: Message[]): UIMessage[]
```

Exports: `uiMessagesToCoreMessages`, `coreMessagesToUIMessages`, `CreateUIAttachment`, `UIAttachment`, `UIError`, `UIMessage`, `UIMessagePart`, `UIMessageRole`, `UIStreamEvent`, `UIStreamRequest`, and `UIStreamResume`.

Return to the [`@anvia/core` overview](/packages/core).
