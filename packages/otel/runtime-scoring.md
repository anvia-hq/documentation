# Runtime scoring

`createOtelScorer()` records a score for an existing trace without creating or running an evaluation
suite. Use it for end-user feedback, automated production checks, moderation outcomes, or other
signals that need to remain queryable beside the runtime trace.

```ts
import { createOtelScorer } from '@anvia/otel'

const scorer = createOtelScorer()

scorer.score({
  id: feedbackId,
  traceId,
  observationId,
  responseId,
  name: 'user-feedback',
  value: liked ? 1 : 0,
  dataType: 'BOOLEAN',
  source: 'end_user',
  comment,
  metadata: { channel: 'thumbs' },
})
```

The scorer emits `gen_ai.evaluation.result` through the OpenTelemetry logs API. Configure a logs
provider and exporter in addition to trace export, or pass an OpenTelemetry `Logger` through the
`logger` option. `score()` validates and emits synchronously; the host logging SDK owns batching,
delivery, flushing, and shutdown.

## Score types

| `dataType` | Accepted `value` | Typical use |
| --- | --- | --- |
| `BOOLEAN` | `1` or `0` | Like/dislike, accepted/rejected, helpful/not helpful |
| `NUMERIC` | A finite number | Rating, confidence, quality, or cost score |
| `CATEGORICAL` | A string | Reason, class, or rubric label |

`BOOLEAN` infers `pass` for `1` and `fail` for `0`. Other values infer `unknown` unless a string is
`pass`, `fail`, or `invalid`. Supply `outcome` or `label` when the application needs a different
interpretation.

## Correlation and identity

- `traceId` is required and must be a valid 32-character OpenTelemetry trace ID.
- `observationId` is optional; when supplied, it must be a valid 16-character span ID and the log
  record receives that span context.
- `responseId` can associate the score with a model response when the application has one.
- Use a stable opaque `id` when a later score should replace or supersede the same application
  feedback record. Omitting it generates a new ID for every event.
- Set `source: 'end_user'` explicitly for user-submitted feedback. Omitted sources are treated as
  telemetry by Lens.

The scorer requires a non-empty `name`, rejects non-finite numeric values, and limits `comment` to
2,000 characters. Validate authorization, comment text, and metadata at the application boundary.
Do not send raw personal identifiers merely to make feedback attributable; keep that relationship in
application-owned data or use an approved opaque identifier.

## Lens compatibility

Lens v0.9.1 or later preserves `source: 'end_user'` during OTLP ingestion and presents that
provenance separately from telemetry-generated and internal human evaluations.
