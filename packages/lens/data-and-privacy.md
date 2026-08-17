# Data and privacy

```ts
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const tracing = lens.observer({
  captureMode: 'full',
  captureMaxBytes: 64 * 1024,
  redactInputs: true,
  redactOutputs: true,
})
```

Safe capture omits prompt and response bodies. Full capture can include instructions, messages, documents, tool values, and model output. Redaction walks captured values but is a safeguard, not a complete data-loss-prevention system.

Evaluation `includePayloads` and `includeMetadata` are separate reporter controls. Keep both disabled until the corresponding data has an approved export, access, retention, and deletion policy.
