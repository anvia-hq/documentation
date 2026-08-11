# `@anvia/studio` API reference

All supported exports come from `@anvia/studio`. Runtime route handlers and UI modules are internal.

## `Studio`

```ts
class Studio implements AnviaStudio {
  constructor(targets?: StudioTarget[], options?: StudioOptions)
  get app(): import('hono').Hono
  fetch(request: Request): Response | Promise<Response>
  config(): StudioConfig
  traceObserver(): StudioTraceObserver
  start(options?: StudioServeOptions): this
  serve(options?: StudioServeLifecycleOptions): Promise<void>
  close(): void
}
```

`start()` starts a server and returns immediately. `serve()` follows a caller-owned lifecycle and resolves after shutdown. `fetch()` makes the same application usable in runtimes or servers that accept a Fetch handler.

```ts
type StudioServeOptions = {
  port?: number
  hostname?: string
  log?: boolean
  handleSignals?: boolean
}

type StudioServeLifecycleOptions = Omit<StudioServeOptions, 'handleSignals'> & {
  signal?: AbortSignal
  onShutdown?: () => void | Promise<void>
}
```

## Targets and configuration

```ts
type StudioTarget = Agent | Pipeline<any, any>

type StudioOptions = {
  evals?: StudioEvalSuite<any, any, any>[]
  quickPrompts?: Record<string, string[]>
  stores?: StudioStores
  ui?: boolean | StudioUiOptions
  models?: StudioModelConfig
}
```

`StudioUiOptions` configures `path`, `rootRoutes`, `title`, `redirectRoot`, `clientScript`, and `protectShell`. `StudioStores` independently selects session, trace, pipeline-log, and pipeline-run stores; session and pipeline stores may be disabled with `false` where the type permits it.

The target configuration types are `StudioAgent`, `StudioAgentConfig`, `StudioAgentRuntimeSummary`, `StudioPipeline`, `StudioPipelineConfig`, `StudioPipelineDetail`, and `StudioConfig`.

## Models

```ts
type StudioModelRef = string | { provider: string; model: string }

type StudioModelProvider = {
  id: string
  name?: string
  defaultModel?: string
  models?: StudioModelDefinition[]
  createCompletionModel(model: string): CompletionModel | StreamingCompletionModel
  listModels?: () => Promise<ModelList>
  metadata?: JsonObject
}

type StudioModelConfig = {
  providers: StudioModelProvider[]
  default?: StudioModelRef
  agents?: Record<string, StudioAgentModelPolicy>
}
```

Supporting public types include `StudioModelDefinition`, `StudioModelModality`, `StudioModelModalities`, `StudioAgentModelPolicy`, `StudioModelSummary`, `StudioModelProviderConfig`, `StudioAgentModelPolicyConfig`, `StudioModelsConfig`, and `StudioAgentModelsSummary`.

## Stores

```ts
function createInMemoryStudioStore():
  & StudioSessionStore
  & StudioTraceStore
  & StudioPipelineLogStore
  & StudioPipelineRunStore

type SqliteSessionStoreOptions = { path?: string }

function createSqliteSessionStore(options?: SqliteSessionStoreOptions):
  & StudioSessionStore
  & StudioTraceStore
  & StudioPipelineLogStore
  & StudioPipelineRunStore
```

Store contracts are intentionally public so applications can provide another backend:

| Contract | Responsibilities |
| --- | --- |
| `StudioMemoryStore` | Append messages and record memory errors. |
| `StudioSessionStore` | Create, list, load, update, and delete Studio sessions. |
| `StudioTraceStore` | Save, get, and list traces. |
| `StudioPipelineLogStore` | Append and list ordered pipeline log entries. |
| `StudioPipelineRunStore` | Save, get, and list replayable pipeline runs. |

Their related input, list-options, record, status, summary, paging, and event types are public and listed by family below.

## Trace observer

```ts
class StudioTraceObserver implements AgentObserver {
  constructor(options: StudioTraceObserverOptions)
  startRun(args: AgentRunStartArgs): AgentRunObserver
}

type StudioTraceObserverOptions = {
  store: StudioTraceStore | (() => StudioTraceStore | undefined) | undefined
}

function traceSummary(trace: StudioTrace): StudioTraceSummary
```

Trace records use `StudioTrace`, `StudioTraceSummary`, `StudioTraceObservation`, `StudioTraceStatus`, `StudioTraceObservationKind`, `StudioTraceListOptions`, and `StudioSessionTraceListOptions`.

## Requests, events, and errors

`AgentRunRequest` accepts one message plus optional history; `AgentRunUIRequest` accepts a UI message array. Both support session, streaming, max-turn, tool-concurrency, model, metadata, and trace controls. `AgentRunResponse` aliases `PromptResponse`.

`AgentRunStreamEvent` combines core agent events with Studio approval, question, session-log, pipeline-log, and pipeline-final events.

```ts
type StudioErrorCode =
  | 'bad_request'
  | 'conflict'
  | 'not_found'
  | 'payload_too_large'
  | 'unsupported_capability'
  | 'internal_error'
```

`StudioErrorResponse` wraps the code, message, and optional JSON details.

## Public type inventory

The remaining public types are grouped by the Studio surface that produces or consumes them.

| Surface | Public types |
| --- | --- |
| Capabilities and status | `StudioCapability`, `StudioCapabilityConfig`, `StudioStatusSummary`, `StudioStores`, `StudioConfig` |
| Evaluations | `StudioEvalSuite`, `StudioEvalSuiteConfig`, `StudioEvalCasePreview`, `StudioEvalMetricSummary`, `StudioEvalRunRequest`, `StudioEvalRunResponse` |
| Tools and MCP | `StudioAgentToolSource`, `StudioAgentToolApprovalMetadata`, `StudioAgentToolMetadata`, `StudioAgentToolsSummary`, `StudioToolRunRequest`, `StudioToolRunResponse`, `StudioAgentMcpToolMetadata`, `StudioAgentMcpServerMetadata`, `StudioAgentMcpsSummary` |
| Approvals | `StudioToolApproval`, `StudioToolApprovalDecision`, `StudioToolApprovalStatus`, `StudioToolApprovalTranscript`, `StudioToolApprovalRequestEvent`, `StudioToolApprovalResultEvent` |
| Questions | `StudioToolQuestion`, `StudioToolQuestionChoice`, `StudioToolQuestionPrompt`, `StudioToolQuestionAnswer`, `StudioToolQuestionStatus`, `StudioToolQuestionTranscript`, `StudioToolQuestionRequestEvent`, `StudioToolQuestionResultEvent` |
| Sessions and transcripts | `StudioSession`, `StudioSessionSummary`, `StudioSessionCreateInput`, `StudioSessionListOptions`, `StudioSessionRunStatus`, `StudioSessionRunTranscriptInput`, `StudioTranscriptEntry`, `StudioTranscriptChatEntry`, `StudioTranscriptReasoningEntry`, `StudioTranscriptToolEntry`, `StudioTranscriptAttachment`, `StudioTranscriptChildAgentEvent` |
| Session logs | `StudioSessionLogEntry`, `StudioSessionLogAppendInput`, `StudioSessionLogListOptions`, `StudioSessionLogLevel`, `StudioSessionLogCategory`, `StudioSessionLogEvent` |
| Pipeline runs | `StudioPipelineRunRequest`, `StudioPipelineReplayRequest`, `StudioPipelineRunResponse`, `StudioPipelineRunRecord`, `StudioPipelineRunSaveInput`, `StudioPipelineRunListOptions`, `StudioPipelineRunGetOptions`, `StudioPipelineRunStatus`, `StudioPipelineFinalEvent` |
| Pipeline logs | `StudioPipelineLogEntry`, `StudioPipelineLogAppendInput`, `StudioPipelineLogListOptions`, `StudioPipelineLogLevel`, `StudioPipelineLogCategory`, `StudioPipelineLogEvent` |
| Knowledge | `StudioAgentKnowledgeConfig`, `StudioKnowledgeSourceKind`, `StudioKnowledgeSourceSummary`, `StudioStaticKnowledgeDocument`, `StudioKnowledgeEvidence`, `StudioKnowledgeEvidenceDocument`, `StudioKnowledgeItem`, `StudioKnowledgeItemKind`, `StudioKnowledgeItemsPage`, `StudioKnowledgeSummary` |
| Memory inspection | `StudioMemoryContext`, `StudioMemoryAppendInput`, `StudioMemoryErrorInput`, `StudioMemoryUserSummary`, `StudioMemoryConversationSummary`, `StudioMemoryConversationsPage`, `StudioMemoryUsersPage`, `StudioMemoryConversationMessages`, `StudioMemoryConversationSteps`, `StudioMemoryMessageRecord`, `StudioMemorySourceKind`, `StudioMemorySourceSummary`, `StudioMemorySourcesPage`, `StudioMemorySourceConversationSummary`, `StudioMemorySourceConversationsPage`, `StudioMemorySourceUsersPage`, `StudioMemorySourceConversationMessages`, `StudioMemorySourceConversationSteps` |
| Sandboxes | `StudioSandboxCapabilities`, `StudioSandboxSummary`, `StudioSandboxesSummary`, `StudioSandboxFileType`, `StudioSandboxFileEntry`, `StudioSandboxFilesResponse`, `StudioSandboxPort`, `StudioSandboxPortsResponse`, `StudioSandboxProcessStatus`, `StudioSandboxProcess`, `StudioSandboxProcessesResponse`, `StudioSandboxProcessLogsResponse` |
| Observability | `StudioObservabilityEventType`, `StudioObservabilityEvent`, `AgentTraceInfo`, `AgentTraceOptions` |

The exact fields for these transport and storage types are part of the published declarations. Prefer consuming the types directly instead of reproducing request shapes locally.
