# Data and privacy

Start with `captureMode: 'safe'`. Safe capture keeps operational attributes while omitting captured prompt and response bodies.

```ts
const tracing = otel.create({
  captureMode: 'safe',
  captureMaxBytes: 32_768,
  transformInput: redactInput,
  transformOutput: redactOutput,
})
```

Full capture serializes model inputs, outputs, tool values, and related runtime payloads. `captureMaxBytes` bounds each captured value; it is not a total trace-size limit.

Transforms run before captured values are exported. They should be deterministic, fast, and safe for unexpected shapes. Operational metadata and errors may still contain identifiers, so also review trace metadata, tool names, exception messages, exporter access, and backend retention.

For eval logs, configure `includePayloads`, `includeMetadata`, `captureMaxBytes`, `transformInput`, and `transformOutput` on the reporter separately.
