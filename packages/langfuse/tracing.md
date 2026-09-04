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

Attach `tracing` under a named key in the agent's `observability.observers` record (for example `observers: { tracing }`); `primaryTrace` references one of those keys. Runs become Langfuse agent observations with generation, tool, guardrail, event, usage, trace, and error detail.

Use `captureMode: 'full'` only when model and tool payloads may be exported. Call `langfuse.flush()` for short-lived work and `langfuse.close()` during final cleanup.
