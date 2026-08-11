# Data and privacy

Safe capture is the default and omits traced prompt and response bodies. Evaluation case payloads and metadata are also omitted unless enabled independently.

```ts
const tracing = lens.createFromEnv({
  captureMode: 'safe',
  captureMaxBytes: 32_768,
  redactInputs: true,
  redactOutputs: true,
  redaction: {
    patterns: [
      { name: 'customer-id', regex: /cust_[a-z0-9]+/gi },
    ],
    replacement: '[REDACTED]',
  },
})
```

Full capture can include model, tool, and agent payloads. Redaction runs before export, and `captureMaxBytes` limits each captured value rather than the complete trace.

Keep `ANVIA_LENS_SECRET_KEY` on the server. Scope ingestion keys by project, rotate them through Lens, and avoid exposing them in browser bundles, screenshots, client logs, or CI output.

Evaluate retention, access roles, exported metadata, exception messages, and custom trace fields as part of the same data policy. Redaction helpers cannot remove sensitive values they never receive or patterns they do not recognize.
