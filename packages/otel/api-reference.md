# `@anvia/otel` API reference

```ts
import {
  createOtelObserver,
  createOtelEvalReporter,
  type OtelObserverOptions,
  type OtelEvalReporterOptions,
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
