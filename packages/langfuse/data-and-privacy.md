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

The redactor is implemented by `@anvia/core/redaction` and re-exported as
`createPiiRedactor()` for compatibility. Default patterns require a valid issuer prefix and Luhn
checksum for payment cards, avoid treating longer grouped digit runs as phone numbers, recognize
bearer tokens and common secret-key prefixes, replace circular references, and cap traversal at 16
levels.

`LangfuseClient.score()` rejects `NaN` and infinite numeric values instead of serializing them as
`null`.
