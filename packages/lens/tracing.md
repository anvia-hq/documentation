# Tracing

`LensClient` owns isolated trace and log providers for the Lens ingestion endpoint. Its observer records agent activity without registering global OpenTelemetry providers.

```ts
import { LensClient } from '@anvia/lens'

const lens = new LensClient({
  serviceName: 'support-api',
  environment: 'production',
  release: process.env.APP_RELEASE,
})
const tracing = lens.observer({ captureMode: 'safe' })
```

Attach `tracing` through an agent's `observers` array. The observer records run, generation, tool, child-agent, error, trace, and usage information. Full capture adds payload bodies and should be enabled only after privacy review.

Call `lens.flush()` at a short-lived delivery boundary and `lens.close()` during final cleanup.
