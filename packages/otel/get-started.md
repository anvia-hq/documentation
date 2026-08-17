# Get started

`@anvia/otel` emits Anvia runs through infrastructure your application already owns. Configure an OpenTelemetry SDK before attaching the observer.

```bash
pnpm add @anvia/core @anvia/otel @opentelemetry/api @opentelemetry/api-logs
```

```ts
import { Agent } from '@anvia/core'
import { createOtelObserver } from '@anvia/otel'

const tracing = createOtelObserver({
  serviceName: 'support-api',
  captureMode: 'safe',
})

const agent = new Agent({
  id: 'support',
  model: model,
  observability: { observers: { tracing } },
})
```

`createOtelObserver()` uses an explicitly supplied `Tracer` or the active global tracer provider. It does not initialize exporters, register global providers, flush processors, or shut them down.

Use an OpenTelemetry Node SDK, a platform integration, or another runtime-specific provider in the application entrypoint. Initialize it before constructing or invoking agents.

## Next

- [Tracing](/packages/otel/tracing)
- [Eval reporting](/packages/otel/eval-reporting)
- [Data and privacy](/packages/otel/data-and-privacy)
- [Lifecycle](/packages/otel/lifecycle)
