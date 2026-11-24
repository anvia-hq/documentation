# Eval reporting

`createOtelEvalReporter()` publishes Anvia evaluation lifecycle and metric results through the OpenTelemetry logs API.

```ts
import { agentEvalTarget, runEvalSuite } from '@anvia/core/evals'
import { createOtelEvalReporter } from '@anvia/otel'

await runEvalSuite({
  name: 'support-regression',
  cases,
  target: agentEvalTarget({
    agent,
    request: ({ input }: { input: string }) => ({ prompt: input }),
  }),
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

Payloads, metadata, invalid outcomes, and redaction transforms are independent policy choices. Evaluation completion reports include case and metric totals, aggregate usage, caller-calculated cost when supplied, and `anvia.eval.run.passed` when the suite reports it. The per-metric summary map is not exported as an attribute; rely on the totals and the individual metric events.

Per-result events also carry the evaluation metadata introduced with `@anvia/core` 1.22.0: `anvia.eval.case.tags` when a case declares tags, `anvia.eval.metric.provider` and `anvia.eval.metric.model` when the metric exposes a model identity, `anvia.eval.trial` and `anvia.eval.trial_count` for multi-trial runs, and `anvia.eval.cached` on a target cache hit. `@anvia/lens` inherits these attributes through the same reporter.

`includeMetadata` defaults to `true` here; the Lens client overrides it to `false`. Set it explicitly when a dashboard depends on tags or model identity being present.
