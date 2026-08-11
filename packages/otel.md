# `@anvia/otel`

`@anvia/otel` converts Anvia agent activity into OpenTelemetry spans and evaluation results into OpenTelemetry logs. Use it when telemetry should flow through an existing vendor-neutral OTel pipeline.

## Install

```bash
pnpm add @anvia/core @anvia/otel
```

Configure the OpenTelemetry SDK and exporters in the host application, then attach the observer:

```ts
import { AgentBuilder } from '@anvia/core'
import { otel } from '@anvia/otel'

const tracing = otel.create({
  serviceName: 'support-api',
  captureMode: 'safe',
})

const agent = new AgentBuilder('support', model)
  .observe(tracing)
  .build()
```

`otel.create()` does not replace SDK registration or exporter setup. It emits through a supplied tracer or the active global OpenTelemetry provider.

## Evaluation reporting

```ts
import { createOtelEvalReporter } from '@anvia/otel'

const reporter = createOtelEvalReporter({
  includeMetadata: true,
  onMissingTrace: 'warn',
})
```

Pass the reporter to an Anvia evaluation suite. Supply an OpenTelemetry logger explicitly when the application does not use the global logging provider.

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
- [Data and privacy](/packages/otel/data-and-privacy)
- [Lifecycle](/packages/otel/lifecycle)
- [Public API](/packages/otel/api-reference)
- [Releases](/packages/otel/releases)
- [Lens observability](/lens/observability)
