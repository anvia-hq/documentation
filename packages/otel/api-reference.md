# `@anvia/otel` API reference

All public symbols are exported from `@anvia/otel`.

## Tracing

```ts
const otel: {
  create(options?: OtelTracingOptions): OtelTracing
}

type OtelTracing = import('@anvia/core/observability').AgentObserver
```

`otel.create()` returns an observer that emits agent, generation, and tool activity through OpenTelemetry.

```ts
type OtelTracingOptions = {
  tracer?: import('@opentelemetry/api').Tracer
  tracerName?: string
  tracerVersion?: string
  serviceName?: string
  captureMode?: 'safe' | 'full'
  captureMaxBytes?: number
  transformInput?: (value: unknown) => unknown
  transformOutput?: (value: unknown) => unknown
}
```

If `tracer` is omitted, the adapter resolves a tracer from the active OpenTelemetry API provider using the configured name and version.

## Evaluation reporter

```ts
function createOtelEvalReporter<
  Input = unknown,
  Output = unknown,
  Expected = unknown,
>(
  options?: OtelEvalReporterOptions,
): import('@anvia/core/evals').EvalReporter<Input, Output, Expected>
```

```ts
type OtelEvalReporterOptions = {
  logger?: import('@opentelemetry/api-logs').Logger
  loggerName?: string
  loggerVersion?: string
  publishInvalid?: boolean
  includeMetadata?: boolean
  includePayloads?: boolean
  captureMaxBytes?: number
  transformInput?: (value: unknown) => unknown
  transformOutput?: (value: unknown) => unknown
  onMissingTrace?: 'emit' | 'ignore' | 'warn' | 'throw'
}
```

## Export inventory

| Kind | Public exports |
| --- | --- |
| Values | `otel`, `createOtelEvalReporter` |
| Types | `OtelTracing`, `OtelTracingOptions`, `OtelEvalReporterOptions` |

