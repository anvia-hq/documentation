# Langfuse

Lens can receive traces from applications already instrumented with `@langfuse/otel` v5. Point the existing Langfuse OpenTelemetry processor at Lens and keep the application’s trace structure intact.

This integration is useful when you already use Langfuse instrumentation but want to inspect the resulting traces in Lens. New Anvia applications should generally use the native Anvia Lens integration instead, because it also covers Anvia-specific evaluation workflows.

## What the integration does

`LangfuseSpanProcessor` exports an OTLP trace request to Lens. Lens authenticates the request with the project’s public and secret ingestion keys, normalizes the Langfuse attributes, and makes the trace available in the trace explorer.

Lens recognizes the complete Langfuse v5 observation taxonomy:

- `span`
- `generation`
- `event`
- `embedding`
- `agent`
- `tool`
- `chain`
- `retriever`
- `evaluator`
- `guardrail`

For a `generation`, Lens can retain the model, input and output, token usage, reported costs, status, and parent-child hierarchy when those values are present in the exported attributes. Trace-level values such as the trace name, user ID, session ID, tags, version, environment, and release are also normalized when supplied.

## Before you connect

You need:

- A Lens project.
- An active ingestion key for that project.
- A Node.js application using the v5 generation of `@langfuse/otel` and `@langfuse/tracing`.
- A Lens URL reachable from the application process.

Create or manage ingestion keys from the project’s **Settings** page. Copy the secret when the key is created; Lens does not show it again.

## Connection at a glance

Configure the standard Langfuse environment variables with the browser-facing Lens origin:

```dotenv
LANGFUSE_BASE_URL=https://lens.example.com
LANGFUSE_PUBLIC_KEY=pk-lens-...
LANGFUSE_SECRET_KEY=sk-lens-...
LANGFUSE_MEDIA_UPLOAD_ENABLED=false
```

Use the Lens origin for `LANGFUSE_BASE_URL`, not the OTLP path. `LangfuseSpanProcessor` appends `/api/public/otel/v1/traces` when it exports a batch.

Keep `LANGFUSE_MEDIA_UPLOAD_ENABLED=false`. Lens currently accepts Langfuse OTLP traces but does not implement Langfuse media storage.

Then keep or initialize one `LangfuseSpanProcessor` in the application’s OpenTelemetry SDK:

```ts
import { LangfuseSpanProcessor } from '@langfuse/otel'
import { startObservation } from '@langfuse/tracing'
import { NodeSDK } from '@opentelemetry/sdk-node'

const sdk = new NodeSDK({
  spanProcessors: [new LangfuseSpanProcessor()],
})

sdk.start()

const agent = startObservation(
  'support-agent',
  { input: { message: 'Hello' } },
  { asType: 'agent' },
)

try {
  // Run the instrumented application work here.
} finally {
  agent.end()
}
```

Ending an observation closes its timing interval. It does not guarantee that the buffered trace has reached Lens. Long-running services should flush during graceful shutdown, and short-lived jobs and tests should shut the SDK down before exiting:

```ts
await sdk.shutdown()
```

## Verify the connection

Run one instrumented request, then open **Traces** in the same Lens project. Search for the observation name, such as `support-agent`, and open the trace to verify its hierarchy and captured fields.

If nothing appears:

1. Confirm the base URL is reachable from the application host.
2. Confirm the public and secret keys came from the same active project key.
3. Make sure the process flushed or shut down its telemetry SDK.
4. Clear trace filters and select a time range that includes the request.
5. Check Lens API logs for authentication, rate-limit, body-size, or payload errors.

## Next steps

- [Connect existing instrumentation](./langfuse/connect-existing-instrumentation.md) for a migration-oriented setup.
- [Compatibility limits](./langfuse/compatibility-limits.md) for the exact supported boundary.

