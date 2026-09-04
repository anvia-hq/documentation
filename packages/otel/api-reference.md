# `@anvia/otel` API reference

```ts
import {
  createOtelEvalReporter,
  createOtelObserver,
  createOtelPipelineObserver,
  createOtelScorer,
  type OtelEvalReporterOptions,
  type OtelObserverOptions,
  type OtelPipelineObserverOptions,
  type OtelScoreArgs,
  type OtelScoreDataType,
  type OtelScoreOutcome,
  type OtelScorer,
  type OtelScorerOptions,
  type OtelScoreSource,
} from '@anvia/otel'
```

## `createOtelObserver`

```ts
const observer = createOtelObserver({
  tracer,
  tracerName,
  tracerVersion,
  serviceName,
  captureMode,
  captureMaxBytes,
  transformInput,
  transformOutput,
})
```

The observer emits agent runs, generations, tools, and child-agent work through the supplied tracer or the active global provider. It does not create, register, flush, or shut down an OpenTelemetry SDK.

## `createOtelPipelineObserver`

```ts
const pipelineObserver = createOtelPipelineObserver({
  tracer,
  tracerName,
  tracerVersion,
  serviceName,
  captureMode,
  captureMaxBytes,
  transformInput,
  transformOutput,
})
```

The returned `PipelineObserver` emits the Pipeline root run and nested stage spans. Its options share
the same capture and tracer controls as `createOtelObserver()`. Configure it under the same named
`primaryTrace` as the Agent observer when their spans should belong to one trace.

## `createOtelScorer`

```ts
const scorer = createOtelScorer({ logger, loggerName, loggerVersion })
scorer.score(scoreArgs)
```

`OtelScorerOptions` accepts an optional OpenTelemetry `Logger`, logger name, and logger version.
Without an injected logger, the scorer uses the active global logs provider.

`OtelScoreArgs` requires `traceId`, `name`, and a numeric or string `value`. Optional fields are
`id`, `observationId`, `responseId`, `dataType`, `outcome`, `label`, `source`, `suiteName`, `comment`,
`metadata`, and `configId`. Score data types are `NUMERIC`, `CATEGORICAL`, and `BOOLEAN`; sources are
`telemetry` and `end_user`.

See [Runtime scoring](/packages/otel/runtime-scoring) for correlation, validation, and delivery
behavior.

## `createOtelEvalReporter`

```ts
const reporter = createOtelEvalReporter({
  logger,
  loggerName,
  loggerVersion,
  traceObserver,
  publishInvalid,
  includeMetadata,
  includePayloads,
  captureMaxBytes,
  transformInput,
  transformOutput,
  onMissingTrace,
})
```

Pass the reporter to `runEvalSuite()`. When no logger is supplied it uses the active global OpenTelemetry logging provider.
