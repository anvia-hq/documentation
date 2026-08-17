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

The host OpenTelemetry pipeline owns sampling, attribute processors, exporter credentials, retention, and shutdown.
