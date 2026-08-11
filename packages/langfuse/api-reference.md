# `@anvia/langfuse` API reference

All public symbols are exported from `@anvia/langfuse`.

## Tracing and scoring

```ts
const langfuse: {
  create(options?: LangfuseTracingOptions): LangfuseTracing
}

type LangfuseTracing = AgentObserver & {
  flush(): Promise<void>
  shutdown(): Promise<void>
  score(args: LangfuseScoreArgs): Promise<void>
  flushScores(): Promise<void>
  scoreQueueDepth(): number
  getCurrentTrace(): LangfuseTraceHandle | undefined
}
```

`LangfuseTracingOptions` configures credentials, `baseUrl`, environment and release names, service identity, timeouts, score batching/retries, safe or full capture, byte limits, and input/output redaction.

```ts
type LangfuseScoreArgs = {
  traceId?: string
  observationId?: string
  name: string
  value: number | string
  dataType?: 'NUMERIC' | 'CATEGORICAL' | 'BOOLEAN'
  comment?: string
  metadata?: Record<string, JsonValue | undefined>
  configId?: string
  scoreConfigId?: string
  environment?: string
  timestamp?: Date | string
}
```

`LangfuseScoreError` contains the rejected `scores` and original `cause` when available.

## Evaluation reporting

```ts
function createLangfuseEvalReporter<Input = unknown, Output = unknown, Expected = unknown>(
  tracing: Pick<LangfuseTracing, 'score'>,
  options?: LangfuseEvalReporterOptions,
): EvalReporter<Input, Output, Expected>
```

Reporter options control invalid results, strict failure, missing traces, input truncation, messages, and context.

```ts
function runEvalAsExperiment<Input, Output, Expected = unknown>(
  evalOptions: RunEvalSuiteOptions<Input, Output, Expected>,
  experimentOptions: RunEvalAsExperimentOptions<Input, Output, Expected>,
): Promise<RunEvalAsExperimentResult<Input, Output, Expected>>
```

The experiment options add Langfuse tracing, optional dataset client configuration, pagination, timeouts, score publishing, reporter configuration, and context inclusion. The result contains both the Anvia suite result and Langfuse dataset-run result.

## Datasets

```ts
function createLangfuseDatasetClient(
  tracing: Pick<LangfuseTracing, 'score'>,
  options?: LangfuseDatasetClientOptions,
): LangfuseDatasetClient

interface LangfuseDatasetClient {
  createDataset(input: {
    name: string
    description?: string
    metadata?: Record<string, JsonValue | undefined>
  }): Promise<LangfuseDataset<unknown, unknown>>
  getDataset<Input, Expected>(name: string): Promise<LangfuseDataset<Input, Expected>>
  upsertItems<Input, Expected>(
    name: string,
    items: LangfuseDatasetItem<Input, Expected>[],
  ): Promise<void>
  runExperiment<Input, Output, Expected>(
    options: LangfuseRunExperimentOptions<Input, Output, Expected>,
  ): Promise<LangfuseRunExperimentResult>
}
```

Dataset items contain `id`, typed `input`, optional `expected`, and JSON metadata. A run experiment invokes the supplied `run(item)` callback and returns posted count plus per-item errors.

## Prompts

```ts
function createLangfusePromptClient(
  tracing: Pick<LangfuseTracing, 'score'>,
  options?: LangfusePromptClientOptions,
): LangfusePromptClient

interface LangfusePromptClient {
  getPrompt(name: string, options?: LangfusePromptGetOptions): Promise<LangfusePrompt>
  getPromptText(name: string, options?: LangfusePromptGetOptions): Promise<string>
  getPromptChat(name: string, options?: LangfusePromptGetOptions): Promise<LangfuseChatMessage[]>
  refresh(): void
}
```

`LangfusePromptGetOptions` selects a version or label, overrides cache TTL, or forces refresh. `LangfusePrompt` reports name, version, labels, text or chat content, type, optional tags, and resolution time.

## Redaction

```ts
function createPiiRedactor(options?: LangfuseRedactionOptions): PiiRedactor

interface PiiRedactor {
  redactString(input: string): string
  redactObject<T>(input: T): T
  redactMessages(input: Message[]): Message[]
  patternNames(): string[]
}
```

`DEFAULT_PATTERNS` is the exported built-in pattern list. `RedactorPattern` has a `name` and `RegExp`; options can replace the built-ins and configure replacement text.

## Export inventory

| Area | Public exports |
| --- | --- |
| Tracing | `langfuse`, `LangfuseTracing`, `LangfuseTracingOptions`, `LangfuseTraceHandle`, `LangfuseCaptureMode` |
| Scoring | `LangfuseScoreArgs`, `LangfuseScoreDataType`, `LangfuseScoreError` |
| Evaluations | `createLangfuseEvalReporter`, `LangfuseEvalReporterOptions`, `runEvalAsExperiment`, `RunEvalAsExperimentOptions`, `RunEvalAsExperimentResult` |
| Datasets | `createLangfuseDatasetClient`, `LangfuseDatasetClient`, `LangfuseDatasetClientOptions`, `LangfuseDataset`, `LangfuseDatasetItem`, `LangfuseRunExperimentOptions`, `LangfuseRunExperimentResult`, `LangfuseRunItemResult`, `LangfuseRunItemError` |
| Prompts | `createLangfusePromptClient`, `LangfusePromptClient`, `LangfusePromptClientOptions`, `LangfusePromptGetOptions`, `LangfusePrompt`, `LangfuseChatMessage` |
| Redaction | `createPiiRedactor`, `DEFAULT_PATTERNS`, `PiiRedactor`, `RedactorPattern`, `LangfuseRedactionOptions`, `LangfuseRedactionMode` |

