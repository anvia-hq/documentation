# Lifecycle

Create one `LensClient` per process or worker lifecycle and reuse its observer across agents.

```ts
import { LensClient } from '@anvia/lens'

const lens = new LensClient({ serviceName: 'support-api' })
const tracing = lens.observer()

try {
  await runWork(tracing)
  await lens.flush()
} finally {
  await lens.close()
}
```

`flush()` delivers buffered data while keeping the client usable. `close()` performs final shutdown and is idempotent; new observer work is rejected afterward. Stop accepting work and wait for active runs before closing a long-lived service.

Process signals do not unwind an `await using` scope. Abort and await active Agent runs before
calling `lens.close()` so Core can finalize their root observations as `cancelled`. When Studio owns
the runs, put `lens.close()` in `Studio.serve({ onShutdown })`.
