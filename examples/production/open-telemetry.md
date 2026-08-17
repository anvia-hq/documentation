# OpenTelemetry tracing

**Level:** Application

## Outcome

Attach Anvia spans to an application-owned OpenTelemetry SDK and export both agent traces and
correlated evaluation events through OTLP.

## When to use it

Use `@anvia/otel` when your service already standardizes on OpenTelemetry or sends telemetry to an
OTLP-compatible backend. Use [Lens](/examples/production/tracing-with-lens) or
[Langfuse](/examples/production/langfuse) for their dedicated operational workflows.

## Ownership and flow

```text
application NodeSDK -> global providers/exporters
Anvia agent -> @anvia/otel observer -> OTel spans -> collector/backend
Anvia eval -> OTel eval reporter -> OTel logs -> collector/backend
```

`@anvia/otel` maps Anvia events. It does not start, flush, or shut down the application's SDK.

## Setup

```sh
pnpm add @anvia/core @anvia/openai @anvia/otel \
  @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-logs-otlp-http @opentelemetry/sdk-logs
```

## Bootstrap boundary

Initialize the SDK before importing or constructing application agents:

```ts
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";

export const telemetry = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  logRecordProcessors: [
    new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() }),
  ],
});

telemetry.start();
```

## Agent boundary

```ts
import { Agent } from "@anvia/core/agent";
import { OpenAIClient } from "@anvia/openai";
import { createOtelObserver } from "@anvia/otel";

const tracing = createOtelObserver({
  serviceName: "support-api",
  captureMode: "safe",
});

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });
export const agent = new Agent({
  id: "support",
  model: openai.completionModel({
      modelId: "gpt-5.5",
      api: "responses"
  }),
  instructions: "Answer support questions concisely.",
  observability: { observers: { tracing } },
});
```

At graceful shutdown, stop accepting requests, wait for active work, then `await telemetry.shutdown()`.

## Expected behavior and failures

Agent runs, generations, and tools appear as related spans. Eval reporter events require an OTel logs
pipeline in addition to traces. An exporter outage should not silently become application success
criteria; alert on dropped telemetry and decide whether the workload may continue.

## Privacy, security, and production adaptations

Use `captureMode: "safe"` to omit prompt and response bodies. Treat attributes, IDs, exceptions, and
explicit metadata as sensitive too. Configure resource attributes, sampling, batching, collector
authentication, TLS, bounded queues, and deployment-specific shutdown timeouts in application OTel
bootstrap. Avoid registering multiple global providers.

## Tests

Inject an in-memory exporter and assert span names, parentage, safe capture, error status, and shutdown
drain. Keep exporter-network tests separate. Add a smoke trace for each deployment environment.

## Source and extensions

- Source: [`10_integrations/05-otel-tracing.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/10_integrations/05-otel-tracing.ts)
- Read the [`@anvia/otel` package guide](/packages/otel/get-started).
- Extend with correlated eval reporting, collector tail sampling, and application HTTP/database spans.
