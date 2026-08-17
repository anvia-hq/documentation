# Tracing

```ts
import { createOtelObserver } from '@anvia/otel'

const tracing = createOtelObserver({
  serviceName: 'support-api',
  captureMode: 'safe',
})
```

Attach the observer to an agent. It uses a supplied `tracer` or the active global tracer provider and emits run, generation, tool, child-agent, and error spans.

The package does not initialize exporters or own provider lifecycle. Configure and start the application's OpenTelemetry SDK before invoking observed agents.
