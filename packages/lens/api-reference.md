# `@anvia/lens` API reference

All public symbols are exported from `@anvia/lens`.

## Lens lifecycle

```ts
const lens: {
  create(options?: LensTracingOptions): LensTracing
  createFromEnv(options?: LensFromEnvOptions): LensTracing
  evals<Input = unknown, Output = unknown, Expected = unknown>(
    options?: LensEvalsOptions,
  ): LensEvalIntegration<Input, Output, Expected>
}
```

```ts
type LensTracing = AgentObserver & {
  readonly enabled: boolean
  flush(): Promise<void>
  shutdown(): Promise<void>
}

type LensEvalIntegration<Input, Output, Expected> = {
  readonly enabled: boolean
  observer: LensTracing
  reporter: LensEvalReporter<Input, Output, Expected>
  flush(): Promise<void>
  shutdown(): Promise<void>
}
```

`createFromEnv()` can return a disabled observer when `optional` is enabled and required credentials are absent.

## Configuration

```ts
type LensCaptureMode = 'safe' | 'full'

type LensTracingOptions = {
  baseUrl?: string
  publicKey?: string
  secretKey?: string
  serviceName?: string
  environment?: string
  release?: string
  timeoutMs?: number
  captureMode?: LensCaptureMode
  captureMaxBytes?: number
  redactInputs?: boolean
  redactOutputs?: boolean
  redaction?: LensRedactionOptions
}

type LensFromEnvOptions = Omit<
  LensTracingOptions,
  'baseUrl' | 'publicKey' | 'secretKey'
> & { optional?: boolean }

type LensEvalsOptions = LensFromEnvOptions & LensEvalReporterOptions
```

`resolveLensConfig(options?)` resolves explicit options and environment configuration into required connection values. It throws when required configuration is missing.

## Evaluation reporter

```ts
function createLensEvalReporter<Input = unknown, Output = unknown, Expected = unknown>(
  tracing: LensTracing,
  options?: LensEvalReporterOptions,
): LensEvalReporter<Input, Output, Expected>

type LensEvalReporterOptions = {
  publishInvalid?: boolean
  includeMetadata?: boolean
  includePayloads?: boolean
  onMissingTrace?: 'emit' | 'ignore' | 'warn' | 'throw'
  flushOnRunEnd?: boolean
}
```

`LensEvalReporter<Input, Output, Expected>` aliases the matching `EvalReporter` from `@anvia/core/evals`.

## Dataset client

```ts
function createLensDatasetClient(
  tracing: LensTracing,
  options?: LensDatasetClientOptions,
): LensDatasetClient

interface LensDatasetClient {
  getDataset<Input = unknown, Expected = unknown>(
    name: string,
    options?: { version?: string },
  ): Promise<LensDataset<Input, Expected>>
}
```

`LensDatasetClientOptions` can override `baseUrl`, credentials, `pageSize`, and `timeoutMs`. `LensDatasetError` exposes the HTTP `status` when present and a stable `code`.

```ts
type LensDataset<Input = unknown, Expected = unknown> = {
  name: string
  version: string
  description?: string
  metadata?: Record<string, JsonValue | undefined>
  items: LensDatasetItem<Input, Expected>[]
}

type LensDatasetItem<Input = unknown, Expected = unknown> = {
  id: string
  input: Input
  expected?: Expected
  context?: string[]
  retrievalContext?: string[]
  metadata?: Record<string, JsonValue | undefined>
}
```

## Redaction

```ts
function createLensRedactor(options?: LensRedactionOptions): {
  redact(value: unknown): unknown
}

type LensRedactorPattern = { name: string; regex: RegExp }
type LensRedactionOptions = {
  patterns?: LensRedactorPattern[]
  replacement?: string
}

const DEFAULT_PATTERNS: LensRedactorPattern[]
```

## Export inventory

| Kind | Public exports |
| --- | --- |
| Values | `lens`, `resolveLensConfig`, `createLensDatasetClient`, `createLensEvalReporter`, `createLensRedactor`, `DEFAULT_PATTERNS` |
| Classes | `LensDatasetError` |
| Lifecycle types | `LensTracing`, `LensTracingOptions`, `LensFromEnvOptions`, `LensCaptureMode`, `LensEvalIntegration`, `LensEvalsOptions` |
| Evaluation types | `LensEvalReporter`, `LensEvalReporterOptions` |
| Dataset types | `LensDataset`, `LensDatasetItem`, `LensDatasetClient`, `LensDatasetClientOptions`, `LensDatasetGetOptions` |
| Redaction types | `LensRedactionOptions`, `LensRedactorPattern` |

