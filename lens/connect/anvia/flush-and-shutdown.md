# Flush and close

`LensClient` buffers trace and evaluation telemetry. Agent completion and telemetry delivery are separate boundaries, so short-lived processes must flush before exiting.

## Short-lived scripts

```ts
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const tracing = lens.observer()

try {
  const agent = createAgent({ observability: { observers: { tracing } } })
  const result = await agent.generate({ prompt: 'Run the smoke test.' })
  await lens.flush()
  console.log(result.status)
} finally {
  await lens.close()
}
```

`flush()` waits for current trace and log batches while leaving the client usable. `close()` shuts down the client's isolated providers and is idempotent. New observer operations after close fail.

## Long-running services

Create one client during application startup. During graceful termination:

1. Stop accepting new requests or jobs.
2. Wait for active agent runs to settle.
3. Call and await `lens.close()` within the platform's termination grace period.

Do not close the client after every request. If a framework owns signal handling, register cleanup through its lifecycle instead of installing competing process handlers.

## Optional local tracing

```ts
const lens = new LensClient({ optional: true })
const tracing = lens.observer()

console.log(lens.enabled)
```

With no Lens connection variables, optional mode returns a disabled client whose observer is a no-op and whose `flush()` and `close()` are safe. Partial credentials still fail validation.

## Evaluations

An evaluation reporter is created from the same client:

```ts
const reporter = lens.evalReporter({ includePayloads: true })
await runEvalSuite({ ...options, reporters: [reporter] })
await lens.flush()
```

The reporter does not own a separate lifecycle. Close the shared client once all observed runs and evaluation reports are complete.

If delivery is missing, confirm the shutdown path is awaited, active work finishes before close, credentials match the project, the Lens origin is reachable, and `timeoutMs` fits the deployment grace period.
