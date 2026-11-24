# `@anvia/otel`

`@anvia/otel` converts Anvia Agent and Pipeline activity into OpenTelemetry spans and evaluation or
runtime score results into OpenTelemetry logs. Use it when telemetry should flow through an existing
vendor-neutral OTel pipeline.

## Install

```bash
pnpm add @anvia/core @anvia/otel @opentelemetry/api zod
```

Configure the OpenTelemetry SDK and exporters in the host application, then attach the observer:

```ts
import { Agent } from '@anvia/core'
import { createOtelObserver } from '@anvia/otel'

const agentTracing = createOtelObserver({
  serviceName: 'support-api',
  captureMode: 'safe',
})

const agent = new Agent({
  id: 'support',
  model: model,
  observability: {
    observers: { otel: agentTracing },
    primaryTrace: 'otel',
  },
})
```

Use `createOtelPipelineObserver()` in a Pipeline's constructor to emit its root run and nested stage
spans. Give the Pipeline and its Agents the same `primaryTrace` name to keep orchestration, model,
and tool spans in one trace.

Neither observer replaces SDK registration or exporter setup. They emit through a supplied tracer
or the active global OpenTelemetry provider.

## Dependency generations

OTel integrations no longer use the separate `@opentelemetry/api-logs` package: `@anvia/otel` uses the stable
logs API (`Logger`, `SeverityNumber`) from `@opentelemetry/api` 1.10. The three adapters target different
generations, so install a logging SDK that matches the one you use:

| Adapter | OTel API | SDK / exporters |
| --- | --- | --- |
| `@anvia/otel` | `^1.10.0` | Your host SDK; use a compatible stable log provider. |
| `@anvia/lens` | `^1.10.0` | `sdk-trace`, `sdk-logs`, and OTLP HTTP exporters `^0.301.2`. |
| `@anvia/langfuse` | `>=1.9.1 <1.10.0` | `sdk-trace-base` / `sdk-trace-node` `^2.12.0`, Langfuse `^6.1.1`. |

Do not install an unspecified logging SDK alongside `@anvia/otel`: mismatched logger types or a second
registration can drop score logs. These are SDK integration requirements, not Lens-server compatibility
claims.

## Evaluation reporting

```ts
import { createOtelEvalReporter } from '@anvia/otel'

const reporter = createOtelEvalReporter({
  includeMetadata: true,
  onMissingTrace: 'warn',
})
```

Pass the reporter to an Anvia evaluation suite. Supply an OpenTelemetry logger explicitly when the application does not use the global logging provider.

## Runtime scoring

```ts
import { createOtelScorer } from '@anvia/otel'

const scorer = createOtelScorer()
scorer.score({
  traceId,
  name: 'user-feedback',
  value: liked ? 1 : 0,
  dataType: 'BOOLEAN',
  source: 'end_user',
})
```

Runtime scores use the same OpenTelemetry logs pipeline without requiring an eval suite. They can
represent Boolean feedback, numeric ratings, or categorical outcomes.

## Capture patterns

- Start with `captureMode: 'safe'`.
- Use `captureMaxBytes` to bound serialized values.
- Apply `transformInput` and `transformOutput` before telemetry leaves the process.
- Decide explicitly what a missing trace should do during evaluation reporting.

## Compatibility

The package peers with `@anvia/core` and uses the OpenTelemetry API packages. SDK providers, processors, exporters, and shutdown remain application-owned.

## Next steps

- [Get started](/packages/otel/get-started)
- [Tracing](/packages/otel/tracing)
- [Eval reporting](/packages/otel/eval-reporting)
- [Runtime scoring](/packages/otel/runtime-scoring)
- [Data and privacy](/packages/otel/data-and-privacy)
- [Lifecycle](/packages/otel/lifecycle)
- [Public API](/packages/otel/api-reference)
- [Releases](/packages/otel/releases)
- [Lens observability](/lens/observability)
