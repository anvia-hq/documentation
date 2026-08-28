# Data and privacy

```ts
const tracing = createOtelObserver({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  transformInput: redactInput,
  transformOutput: redactOutput,
})
```

Safe capture omits payload bodies. Full capture can export instructions, messages, tool values, documents, and model output. Transforms run before serialization; make them deterministic, non-mutating, and covered by sensitive-data tests.

Pipeline observers follow the same policy. In full capture, Pipeline input, final output, and every
stage's input and output can leave the process. Apply the same transforms to
`createOtelPipelineObserver()` and review intermediate values, not only the final Agent response.

Runtime score comments and metadata are exported as log attributes and do not pass through observer
input/output transforms. Validate and minimize them before calling `score()`. In particular, avoid
raw account identifiers, email addresses, and unreviewed free-form user content.

The host OpenTelemetry pipeline owns sampling, attribute processors, exporter credentials, retention, and shutdown.
