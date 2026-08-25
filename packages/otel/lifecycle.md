# Lifecycle

The host application owns every OpenTelemetry lifecycle operation.

```ts
const sdk = new NodeSDK({
  // resource, span processors, log processors, exporters
})

await sdk.start()

try {
  await startApplication()
} finally {
  await sdk.shutdown()
}
```

Create the Anvia observer after telemetry initialization. In serverless or short-lived workers, ensure the platform gives processors enough time to flush before the invocation ends.

On `SIGINT` or `SIGTERM`, stop accepting work, abort and await active Agent runs, then await
`sdk.shutdown()`. Core reports those terminal observer errors with `status: 'cancelled'`. Shutting
down the SDK before the run settles can lose its still-open root span. When Studio owns the runs,
put `sdk.shutdown()` in `Studio.serve({ onShutdown })`.

## Ownership boundaries

`@anvia/otel` does not:

- Install an SDK or exporter.
- Select OTLP endpoints or credentials.
- Configure sampling or resource detectors.
- Flush or shut down providers.
- Guarantee delivery after the host process exits.

Use one application-level lifecycle for Anvia and non-Anvia telemetry so resource attributes, sampling, batching, and shutdown remain consistent.
