# Eval reporting

`createOtelEvalReporter()` publishes Anvia evaluation lifecycle and metric results through the OpenTelemetry logs API.

```ts
import { agentEvalTarget, runEvalSuite } from '@anvia/core/evals'
import { createOtelEvalReporter } from '@anvia/otel'

await runEvalSuite({
  name: 'support-regression',
  cases,
  target: agentEvalTarget(agent),
  metrics,
  reporters: [
    createOtelEvalReporter({
      onMissingTrace: 'warn',
      includeMetadata: true,
    }),
  ],
})
```

Configure a logs provider and exporter as well as the tracing SDK. A trace exporter alone cannot deliver evaluation log records.

When the evaluated output contains valid trace and observation identifiers, metric events correlate with the originating span. `onMissingTrace` controls whether an uncorrelated result is emitted, ignored, warned about, or treated as an error.

Payloads, metadata, invalid outcomes, and redaction transforms are independent policy choices. Evaluation completion reports include case and metric totals, aggregate usage, and caller-calculated cost when supplied.
