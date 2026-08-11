# Lifecycle

The Lens adapter owns isolated telemetry providers, so the tracing instance also owns their flush and shutdown lifecycle.

## Long-lived server

```ts
const tracing = lens.createFromEnv({ serviceName: 'support-api' })

process.once('SIGTERM', async () => {
  await tracing.shutdown()
  process.exit(0)
})
```

Integrate shutdown with the application's existing signal handling rather than registering competing handlers in every module.

## Scripts and workers

Call `flush()` after the last run when the process continues, or `shutdown()` when it will not use the observer again. `lens.evals()` flushes on evaluation run end by default, but an explicit final shutdown remains the safest script boundary.

`timeoutMs` bounds Lens HTTP requests. Network delivery can still fail, so decide whether observability failure should fail the command, be retried by the job system, or only be reported. Do not repeatedly create tracing instances per request; share one instance for the process or worker lifecycle.
