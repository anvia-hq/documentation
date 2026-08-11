# Data and privacy

Start with safe capture and enable payloads only after reviewing where traces are stored and who may access them.

```ts
const tracing = langfuse.create({
  captureMode: 'safe',
  captureMaxBytes: 32_768,
  redactInputs: 'deep',
  redactOutputs: 'deep',
})
```

`createPiiRedactor()` includes patterns for email addresses, Luhn-valid credit cards, phone numbers, IPv4 addresses, JWTs, and common API-key shapes. Add application-specific patterns when identifiers use custom formats.

Shallow redaction covers direct string values; deep redaction recurses into nested arrays and objects. Redaction is pattern-based and cannot guarantee that every sensitive value is recognized.

Also review trace metadata, tool arguments, exception messages, prompt variables, dataset cases, score comments, and prompt content. Keep secret keys server-only and configure project roles and retention in Langfuse.
