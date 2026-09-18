# Data and privacy

```ts
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const tracing = lens.observer({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  redactInputs: true,
  redactOutputs: true,
  redactErrors: true,
  redactMetadata: true,
})
```

Safe capture omits prompt and response bodies. Full capture can include instructions, messages,
documents, tool values, and model output. Error messages, exception stacks, and span status use
`redactErrors`; trace, run-event, tool, score, and evaluation metadata use `redactMetadata`.
`redactErrors` follows `redactOutputs` by default, while `redactMetadata` follows `redactInputs`.
Redaction walks captured values but is a safeguard, not a complete data-loss-prevention system.

Evaluation reporters inherit the client capture limit and redaction policy and accept per-reporter
overrides. Evaluation `includePayloads` and `includeMetadata` remain separate controls. Keep both
disabled until the corresponding data has an approved export, access, retention, and deletion
policy. Payloads exceeding `captureMaxBytes` are reported with `size_limit` status instead of being
exported.

Runtime score metadata follows the configured metadata-redaction policy; comments remain a separate
free-form surface. Validate and minimize both before calling `lens.score()`. Keep user and tenant
identity in application-owned data unless an approved opaque identifier is required for analysis.
