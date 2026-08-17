# Tracing

```ts
import { LangfuseClient } from '@anvia/langfuse'

const langfuse = new LangfuseClient({
  serviceName: 'support-api',
  environment: 'production',
})
const tracing = langfuse.observer({
  captureMode: 'safe',
})
```

Attach `tracing` to an agent's `observers` array. Runs become Langfuse agent observations with generation, tool, guardrail, event, usage, trace, and error detail.

Use `captureMode: 'full'` only when model and tool payloads may be exported. Call `langfuse.flush()` for short-lived work and `langfuse.close()` during final cleanup.
