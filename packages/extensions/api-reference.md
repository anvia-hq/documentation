# `@anvia/extensions` API reference

Exports of `@anvia/extensions` **0.3.0**, grouped by subpath. Toolkit factories return core's
`Toolkit`, and every toolkit options type extends core `ToolkitOptions<ToolName>`
(`include`, `exclude`, `prefix`, `requiresApproval`, `timeoutMs`, `instructions`). See
[Toolkits](/packages/extensions/toolkits) and
[Guardrails, middlewares, and hooks](/packages/extensions/guardrails-middlewares-hooks) for defaults.

## Entry points

| Entry point | Contents |
| --- | --- |
| `@anvia/extensions` | Re-exports `./guardrails`, `./hooks`, `./middlewares`, and `./tools` |
| `@anvia/extensions/tools` | Re-exports every `./tools/*` subpath plus the tool wrappers |
| `@anvia/extensions/tools/fs` | Filesystem toolkit |
| `@anvia/extensions/tools/shell` | Shell toolkit |
| `@anvia/extensions/tools/git` | Git toolkit |
| `@anvia/extensions/tools/http` | HTTP client toolkit |
| `@anvia/extensions/tools/web-fetch` | Web fetch toolkit |
| `@anvia/extensions/tools/web-search` | Web search toolkit and providers |
| `@anvia/extensions/tools/todo` | Task-list toolkit |
| `@anvia/extensions/tools/scratchpad` | Notes toolkit |
| `@anvia/extensions/tools/datetime` | Date and time toolkit |
| `@anvia/extensions/tools/math` | Calculator toolkit |
| `@anvia/extensions/guardrails` | Guardrail policies |
| `@anvia/extensions/middlewares` | Agent middlewares |
| `@anvia/extensions/hooks` | Lifecycle hooks |

## Tools

### `@anvia/extensions/tools/fs`

```ts
function filesystem(options: FilesystemOptions): Toolkit
type FilesystemReadToolName = 'read_file' | 'list_files' | 'grep'
type FilesystemWriteToolName = 'write_file' | 'edit_file' | 'delete_file'
type FilesystemToolName = FilesystemReadToolName | FilesystemWriteToolName
type FilesystemOptions = ToolkitOptions<FilesystemToolName> & {
  rootDir: string
  readOnly?: boolean
  maxFileBytes?: number
  maxEntries?: number
  maxMatches?: number
  maxScannedFiles?: number
  maxMatchLineChars?: number
}
```

### `@anvia/extensions/tools/shell`

```ts
function shell(options: ShellOptions): Toolkit
type ShellToolName = 'run_command'
type ShellExecutionMode = 'execFile' | 'shell'
type ShellOptions = ToolkitOptions<ShellToolName> & {
  rootDir: string
  mode?: ShellExecutionMode
  allowSubdirCwd?: boolean
  allowedCommands?: readonly string[]
  deniedCommands?: readonly string[]
  env?: Record<string, string>
  inheritEnv?: boolean
  maxOutputBytes?: number
  maxOutputChars?: number
}
type ShellCommandResult = {
  command: string
  cwd: string
  exitCode: number | null
  signal: string | null
  timedOut: boolean
  truncated: boolean
  stdout: string
  stderr: string
}
```

### `@anvia/extensions/tools/git`

```ts
function git(options: GitOptions): Toolkit
type GitReadToolName = 'git_status' | 'git_diff' | 'git_log' | 'git_show' | 'git_branch'
type GitWriteToolName = 'git_stage' | 'git_commit'
type GitToolName = GitReadToolName | GitWriteToolName
type GitOptions = ToolkitOptions<GitToolName> & {
  rootDir: string
  readOnly?: boolean
  maxOutputBytes?: number
  maxOutputChars?: number
  gitBinary?: string
}
```

### `@anvia/extensions/tools/http`

```ts
function httpClient(options: HttpClientOptions): Toolkit
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
type HttpClientToolName = 'http_request'
type HttpClientOptions = ToolkitOptions<HttpClientToolName> & {
  baseUrl?: string
  allowedHosts?: readonly string[]
  blockedHosts?: readonly string[]
  allowedOrigins?: readonly string[]
  allowPrivateAddresses?: boolean
  allowedMethods?: readonly HttpMethod[]
  headers?: Record<string, string>
  maxBytes?: number
  maxChars?: number
  maxRedirects?: number
  fetch?: typeof globalThis.fetch
}
```

`HttpClientOptions` also accepts `resolveAddress`, a custom DNS resolver used by the URL safety
checks.

### `@anvia/extensions/tools/web-fetch`

```ts
function webFetch(options?: WebFetchOptions): Toolkit
type WebFetchToolName = 'web_fetch'
type WebFetchOptions = ToolkitOptions<WebFetchToolName> & {
  allowedHosts?: readonly string[]
  blockedHosts?: readonly string[]
  allowedOrigins?: readonly string[]
  allowPrivateAddresses?: boolean
  maxBytes?: number
  maxChars?: number
  maxRedirects?: number
  userAgent?: string
  headers?: Record<string, string>
  fetch?: typeof globalThis.fetch
}
```

### `@anvia/extensions/tools/web-search`

```ts
function webSearch(options: WebSearchOptions): Toolkit
type WebSearchToolName = 'web_search'
type WebSearchOptions = ToolkitOptions<WebSearchToolName> & {
  provider: WebSearchProvider
  maxResults?: number
  maxResultsLimit?: number
}
interface WebSearchProvider {
  readonly name: string
  search(request: WebSearchRequest): Promise<WebSearchProviderResponse>
}
type WebSearchRequest = { query: string; maxResults: number; abortSignal?: AbortSignal }
type WebSearchProviderResponse = { results: readonly WebSearchResult[]; answer?: string }
type WebSearchResult = {
  title: string
  url: string
  snippet: string
  score?: number
  publishedDate?: string
}

function tavily(options: TavilyProviderOptions): WebSearchProvider
function exa(options: ExaProviderOptions): WebSearchProvider
function brave(options: BraveProviderOptions): WebSearchProvider
function searxng(options: SearxngProviderOptions): WebSearchProvider
function serper(options: SerperProviderOptions): WebSearchProvider
function perplexity(options: PerplexityProviderOptions): WebSearchProvider
function firecrawl(options: FirecrawlProviderOptions): WebSearchProvider
function jina(options?: JinaProviderOptions): WebSearchProvider
```

Every provider options type accepts `baseUrl`, `timeoutMs`, and `fetch`. Provider-specific options:

| Type | Options |
| --- | --- |
| `TavilyProviderOptions` | `apiKey`, `searchDepth` (`'basic' \| 'advanced'`), `topic` (`'general' \| 'news'`), `includeAnswer` |
| `ExaProviderOptions` | `apiKey`, `type` (`'auto' \| 'neural' \| 'keyword'`), `includeText`, `maxCharacters` |
| `BraveProviderOptions` | `apiKey`, `country`, `searchLang` |
| `SearxngProviderOptions` | `baseUrl` (required), `engines`, `categories`, `language`, `headers` |
| `SerperProviderOptions` | `apiKey`, `gl`, `hl` |
| `PerplexityProviderOptions` | `apiKey`, `country`, `maxTokensPerPage` |
| `FirecrawlProviderOptions` | `apiKey`, `lang`, `country` |
| `JinaProviderOptions` | `apiKey` (optional) |

### `@anvia/extensions/tools/todo`

```ts
function todo(options?: TodoOptions): Toolkit
type TodoToolName = 'todo_read' | 'todo_write'
type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
type TodoItem = { id: string; content: string; status: TodoStatus }
type TodoOptions = ToolkitOptions<TodoToolName> & { store?: TodoStore; maxItems?: number }
interface TodoStore
class InMemoryTodoStore implements TodoStore
```

### `@anvia/extensions/tools/scratchpad`

```ts
function scratchpad(options?: ScratchpadOptions): Toolkit
type ScratchpadToolName = 'note_get' | 'note_set' | 'note_delete' | 'note_list'
type ScratchpadOptions = ToolkitOptions<ScratchpadToolName> & {
  store?: ScratchpadStore
  maxEntries?: number
  maxValueChars?: number
}
type ScratchpadEntry
interface ScratchpadStore
class InMemoryScratchpadStore implements ScratchpadStore {
  constructor(options?: {
    maxEntries?: number
    maxValueChars?: number
    initial?: Record<string, string>
    now?: () => string
  })
}
```

`maxEntries` and `maxValueChars` on `ScratchpadOptions` apply only to the default in-memory store.

### `@anvia/extensions/tools/datetime`

```ts
function datetime(options?: DatetimeOptions): Toolkit
type DatetimeToolName = 'current_time' | 'convert_timezone' | 'date_math'
type DatetimeOptions = ToolkitOptions<DatetimeToolName> & {
  defaultTimeZone?: string
  now?: () => Date
}
```

### `@anvia/extensions/tools/math`

```ts
function math(options?: MathOptions): Toolkit
type MathToolName = 'calculate'
type MathOptions = ToolkitOptions<MathToolName> & { maxExpressionLength?: number; maxDepth?: number }
function evaluateMathExpression(
  expression: string,
  options?: { maxExpressionLength?: number; maxDepth?: number },
): number
```

### `@anvia/extensions/tools`

Re-exports all toolkit subpaths above, plus:

```ts
function withToolCache<T extends AnyTool | Toolkit>(target: T, options: ToolCacheOptions): T
function withToolTimeout<T extends AnyTool | Toolkit>(target: T, options: ToolTimeoutOptions): T
function withToolRetry<T extends AnyTool | Toolkit>(target: T, options?: ToolRetryOptions): T
function withToolRateLimit<T extends AnyTool | Toolkit>(target: T, options: ToolRateLimitOptions): T
function withToolSummary<T extends AnyTool | Toolkit>(target: T, options?: ToolSummaryOptions): T

type ToolCacheOptions = { ttlMs: number; maxEntries?: number; tools?: readonly string[]; now?: () => number }
type ToolTimeoutOptions = { timeoutMs: number; tools?: readonly string[]; message?: string }
type ToolRetryOptions = {
  maxAttempts?: number
  backoffMs?: number
  maxBackoffMs?: number
  backoffFactor?: number
  retryOn?: (error: unknown, attempt: number) => boolean
  tools?: readonly string[]
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
}
type ToolRateLimitOptions = {
  maxCalls: number
  windowMs: number
  tools?: readonly string[]
  now?: () => number
  message?: string
}
type ToolSummaryOptions = {
  field?: string
  description?: string
  required?: boolean
  tools?: readonly string[]
  onSummary?: (event: ToolSummaryEvent) => void | Promise<void>
}
type ToolSummaryEvent = { toolName: string; summary: string; args: unknown; context?: ToolCallContext }
```

## `@anvia/extensions/guardrails`

```ts
function piiGuardrail(options?: PatternGuardrailOptions): GuardrailPolicy
function secretLeakGuardrail(options?: PatternGuardrailOptions): GuardrailPolicy
function patternGuardrail(options: CustomPatternGuardrailOptions): GuardrailPolicy
function promptInjectionGuardrail(options?: PromptInjectionGuardrailOptions): GuardrailPolicy
function topicGuardrail(options: TopicGuardrailOptions): GuardrailPolicy
function lengthGuardrail(options: LengthGuardrailOptions): GuardrailPolicy
function llmGuardrail(options: LlmGuardrailOptions): GuardrailPolicy

type GuardrailBoundarySelection = 'input' | 'output' | 'both'
type PatternGuardrailAction = 'block' | 'redact'
type PatternGuardrailOptions = {
  id?: string
  boundary?: GuardrailBoundarySelection
  action?: PatternGuardrailAction
  mode?: GuardrailMode
  patterns?: readonly RedactionPattern[]
  replacement?: string
  reason?: string
  message?: string
}
type CustomPatternGuardrailOptions = Omit<PatternGuardrailOptions, 'patterns'> & {
  patterns: readonly RedactionPattern[]
}
type PromptInjectionGuardrailOptions = {
  id?: string
  boundary?: GuardrailBoundarySelection
  mode?: GuardrailMode
  patterns?: readonly RedactionPattern[]
  extraPatterns?: readonly RedactionPattern[]
  model?: CompletionModel
  temperature?: number
  maxTokens?: number
  reason?: string
  message?: string
}
type TopicMatcher = string | RegExp
type TopicGuardrailOptions = {
  id?: string
  allowedTopics?: readonly TopicMatcher[]
  blockedTopics?: readonly TopicMatcher[]
  model?: CompletionModel
  boundary?: GuardrailBoundarySelection
  mode?: GuardrailMode
  reason?: string
  message?: string
  temperature?: number
  maxTokens?: number
}
type LengthGuardrailOptions = {
  id?: string
  maxChars: number
  boundary?: GuardrailBoundarySelection
  action?: 'block' | 'truncate'
  mode?: GuardrailMode
  suffix?: string
  reason?: string
  message?: string
}
type LlmGuardrailOptions = {
  id?: string
  model: CompletionModel
  policy: string
  boundary?: GuardrailBoundarySelection
  mode?: GuardrailMode
  message?: string
  temperature?: number
  maxTokens?: number
}

const PII_PATTERN_NAMES: readonly ['email', 'creditCard', 'phone', 'ipv4']
const SECRET_PATTERN_NAMES: readonly string[] // ten credential pattern names
const DEFAULT_PII_PATTERNS: readonly RedactionPattern[]
const DEFAULT_SECRET_PATTERNS: readonly RedactionPattern[]
const DEFAULT_PROMPT_INJECTION_PATTERNS: readonly RedactionPattern[]
```

## `@anvia/extensions/middlewares`

```ts
function toolOutputLimit(options: ToolOutputLimitOptions): AgentMiddleware
function redactToolOutput(options?: RedactToolOutputOptions): AgentMiddleware
function redactCompletionRequest(options?: RedactCompletionRequestOptions): AgentMiddleware
function sanitizeToolErrors(options?: SanitizeToolErrorsOptions): AgentMiddleware
function historyWindow(options: HistoryWindowOptions): AgentMiddleware

type ToolOutputLimitOptions = { maxChars: number; tools?: readonly string[]; suffix?: string }
// Either a custom redactor, or patterns/replacement — not both.
type RedactCompletionRequestOptions =
  | { redactor: Redactor }
  | { patterns?: readonly RedactionPattern[]; replacement?: string }
type RedactToolOutputOptions = RedactCompletionRequestOptions & { tools?: readonly string[] }
type SanitizeToolErrorsOptions = {
  stripStackTraces?: boolean
  stripAbsolutePaths?: boolean
  pathReplacement?: string
  maxChars?: number
  fallbackMessage?: string
}
type HistoryWindowOptions = {
  maxMessages?: number
  maxChars?: number
  preserveSystemMessages?: boolean
}
```

## `@anvia/extensions/hooks`

```ts
function usageHook(options: UsageHookOptions): AgentLifecycle
function costHook(options: CostHookOptions): AgentLifecycle
function calculateUsageCost(usage: Usage, pricing: TokenPricing): CostBreakdown
function auditHook(options: AuditHookOptions): AgentLifecycle
function jsonlHook(options: JsonlHookOptions): AgentLifecycle
function consoleHook(options?: ConsoleHookOptions): AgentLifecycle

type UsageReportStatus = 'completed' | 'blocked' | 'suspended' | 'error'
type UsageReport = {
  runId: string
  status: UsageReportStatus
  steps: number
  toolCalls: number
  toolFailures: number
  durationMs: number
  usage: Usage
}
type UsageHookOptions = { onReport(report: UsageReport): void | Promise<void>; now?: () => number }

type TokenPricing = {
  inputPerMillion: number
  outputPerMillion: number
  cachedInputPerMillion?: number
  cacheCreationInputPerMillion?: number
}
type CostBreakdown = {
  uncachedInputCost: number
  cachedInputCost: number
  cacheCreationInputCost: number
  outputCost: number
  totalCost: number
}
type CostReportStatus = 'in_progress' | 'completed' | 'blocked' | 'suspended' | 'error'
type CostReport = {
  runId: string
  status: CostReportStatus
  currency: string
  usage: Usage
  cost: CostBreakdown
  budgetExceeded: boolean
}
type CostHookOptions = {
  pricing: TokenPricing
  onCost: (report: CostReport) => void | Promise<void>
  currency?: string
  budget?: number
  onBudgetExceeded?: (report: CostReport) => void | Promise<void>
}

type AuditEventType = 'run.start' | 'step.finish' | 'tool.start' | 'tool.finish' | 'run.finish' | 'run.error'
type AuditEvent // discriminated union on `type`; every event has `timestamp` and `runId`
type AuditHookOptions = {
  onEvent(event: AuditEvent): void | Promise<void>
  includeToolInput?: boolean
  includeToolOutput?: boolean
  timestamp?: () => string
}
type JsonlHookOptions =
  | { filePath: string; includeToolInput?: boolean; includeToolOutput?: boolean; redactor?: Redactor; timestamp?: () => string }
  | { write: (line: string, event: AuditEvent) => void | Promise<void>; includeToolInput?: boolean; includeToolOutput?: boolean; redactor?: Redactor; timestamp?: () => string }
type ConsoleHookOptions = {
  prefix?: string
  logToolInput?: boolean
  logToolOutput?: boolean
  writer?: (line: string) => void
}
```

Hook factories are generic over the agent's `Output` and raw response types, so they fit any agent's
`lifecycle` array.
