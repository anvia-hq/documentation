# Data and privacy

```ts
const tracing = langfuse.observer({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  redactInputs: 'deep',
  redactOutputs: 'deep',
})
```

Safe capture omits prompt and response bodies. Full capture can include instructions, messages, documents, tool values, and model output. Both `true` and `'deep'` recursively redact objects and arrays to a depth of 16, and both preserve base64 data URLs and binary values found inside them. The only difference is the captured value itself: `'deep'` runs it through that same recursive logic, so a whole string that is a base64 data URL survives, while plain `true` pattern-redacts any top-level string.

Redaction patterns reduce exposure but do not prove that all sensitive data is removed. Keep secrets out of trace metadata, apply access and retention policy in Langfuse, and test capture with synthetic sensitive fixtures.
