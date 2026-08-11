# Connect existing Langfuse instrumentation

You do not need to replace existing `@langfuse/tracing` observations to send them to Lens. Retarget the v5 OpenTelemetry exporter, keep one processor for the application, and verify the first trace before changing capture policy.

## Install the v5 packages

If the application is not already on the v5 OpenTelemetry integration, install the packages used by the supported path:

```sh
pnpm add @langfuse/otel @langfuse/tracing @opentelemetry/sdk-node
```

Lens’s compatibility contract is tested against the v5 package generation. Older Langfuse SDKs that send data through a different ingestion API are not covered by this integration.

## Create an ingestion key

In Lens, open the target project and go to **Settings**. Create an ingestion key and save both values:

- The public key identifies the key pair.
- The secret key authenticates ingestion and is shown only when it is created.

Both values must come from the same active key. Revoking the key stops new ingestion immediately.

## Point Langfuse at Lens

Set the standard Langfuse environment variables in the application runtime:

```dotenv
LANGFUSE_BASE_URL=https://lens.example.com
LANGFUSE_PUBLIC_KEY=pk-lens-...
LANGFUSE_SECRET_KEY=sk-lens-...
LANGFUSE_MEDIA_UPLOAD_ENABLED=false
```

`LANGFUSE_BASE_URL` is the browser-facing Lens origin. Do not append `/api/public/otel/v1/traces`; the span processor constructs that endpoint.

The application must be able to resolve and reach this URL. For a service running inside Docker, `localhost` refers to that service’s container, not necessarily the Lens proxy.

### Configure the processor directly

Environment variables are the simplest option. If the application supplies processor options directly, pass the same values explicitly:

```ts
import { LangfuseSpanProcessor } from '@langfuse/otel'

const langfuseProcessor = new LangfuseSpanProcessor({
  baseUrl: 'https://lens.example.com',
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  mediaUploadEnabled: false,
})
```

Do not commit the secret key. Load it from the deployment’s secret manager or protected environment configuration.

## Reuse the application’s OpenTelemetry SDK

If the application already creates a `NodeSDK`, add or retain the Langfuse processor in that SDK. Do not create a second global OpenTelemetry SDK just for Lens.

```ts
import { LangfuseSpanProcessor } from '@langfuse/otel'
import { NodeSDK } from '@opentelemetry/sdk-node'

const langfuseProcessor = new LangfuseSpanProcessor()

const sdk = new NodeSDK({
  spanProcessors: [langfuseProcessor],
})

sdk.start()
```

If the application already registers other processors or instrumentations, retain them in the same SDK configuration. Lens only needs the Langfuse processor’s OTLP trace export.

## Keep existing observations

Existing v5 observations can remain unchanged:

```ts
import { startObservation } from '@langfuse/tracing'

const observation = startObservation(
  'answer-support-request',
  { input: { ticketId: 'ticket_123' } },
  { asType: 'agent' },
)

try {
  await handleSupportRequest()
} finally {
  observation.end()
}
```

For generation observations, Lens recognizes the v5 attributes emitted for `input`, `output`, `model`, `usageDetails`, and cost details. Values appear only when the instrumentation exports them; Lens does not reconstruct missing model payloads or token counts.

## Flush at the correct lifecycle boundary

`observation.end()` completes an individual observation, while export remains buffered by OpenTelemetry. Choose the flush behavior that matches the process:

### Long-running server

Start the SDK once during application startup and shut it down from the server’s graceful termination path:

```ts
let shutdownPromise: Promise<void> | undefined

function shutdownTelemetry() {
  shutdownPromise ??= sdk.shutdown()
  return shutdownPromise
}

process.once('SIGTERM', () => {
  void shutdownTelemetry()
})

process.once('SIGINT', () => {
  void shutdownTelemetry()
})
```

Coordinate this with the application server’s own shutdown sequence so the process stays alive until the promise settles. Do not call `sdk.shutdown()` after every request; shutdown stops the SDK.

### Short-lived job, script, or test

Shut down after all instrumented work completes:

```ts
try {
  await runJob()
} finally {
  await sdk.shutdown()
}
```

When the SDK must remain active, `await langfuseProcessor.forceFlush()` sends currently buffered spans without shutting the provider down. This is useful at a test assertion boundary, but it should not become a per-request network wait in normal server code.

## Verify one representative trace

Generate a trace that includes a parent observation and at least one generation or tool child. In Lens:

1. Open the project’s **Traces** page.
2. Search for the parent observation name.
3. Open the trace and verify the parent-child hierarchy.
4. Inspect the generation’s model, input and output, usage, status, and duration.
5. Confirm the environment, session, user, tags, and release only if the application exports them.

Treat missing data as an instrumentation question first. Lens can normalize supported Langfuse attributes, but it cannot display fields that were never exported.

## Troubleshooting responses

The Lens ingestion endpoint uses Basic authentication with the public and secret key. Common response classes are:

| Response | Meaning | What to check |
| --- | --- | --- |
| `401` | Credentials are absent, invalid, revoked, or belong to an inactive project | Recreate or replace the project key pair |
| `413` | The compressed or decompressed OTLP batch exceeds the configured limit | Reduce exporter batch size or adjust the Lens deployment limit |
| `415` | The content type or content encoding is unsupported | Use the v5 processor’s JSON/protobuf OTLP transport and identity/gzip encoding |
| `429` | The project exceeded its ingestion rate | Honor `Retry-After` and review the deployment rate limit |

See [Compatibility limits](./compatibility-limits.md) before enabling another Langfuse feature against the Lens URL.

