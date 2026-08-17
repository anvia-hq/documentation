# Data and privacy

```ts
const tracing = langfuse.observer({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  redactInputs: 'deep',
  redactOutputs: 'deep',
})
```

Safe capture omits prompt and response bodies. Full capture can include instructions, messages, documents, tool values, and model output. Shallow redaction handles direct strings; `'deep'` recursively processes arrays and objects.

Redaction patterns reduce exposure but do not prove that all sensitive data is removed. Keep secrets out of trace metadata, apply access and retention policy in Langfuse, and test capture with synthetic sensitive fixtures.
