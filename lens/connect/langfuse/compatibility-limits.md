# Langfuse compatibility limits

Lens is a compatible ingestion target for the OpenTelemetry trace format emitted by `@langfuse/otel` 6.0.2. It is not a drop-in implementation of the complete Langfuse service API.

Use this page to decide whether an existing Langfuse feature can be pointed at Lens or needs to remain connected to another backend.

The checked-in compatibility test at [Lens `b06101f`](https://github.com/anvia-hq/lens/blob/b06101f36392d4b1bab5a1b69a53d29e67fc22f5/packages/telemetry/test/langfuse-otel.test.ts) resolves `@langfuse/otel` and `@langfuse/tracing` **6.0.2** in that revision’s lockfile, reviewed 2026-11-23. This identifies the contract-test baseline, not proof that every older/newer release is compatible or that a live deployment has been tested.

## Supported contract

The integration covers trace batches sent by `LangfuseSpanProcessor` to:

```text
POST /api/public/otel/v1/traces
```

The processor authenticates with HTTP Basic authentication derived from `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY`. Lens accepts OTLP JSON or protobuf trace bodies and identity or gzip content encoding. The tested `@langfuse/otel` 6.0.2 path sends JSON to this endpoint.

Lens preserves valid trace and span IDs, parent-child relationships, timing, status, resource attributes, span attributes, events, and links. It recognizes these Langfuse 6.0.2 observation types:

| Observation type | How Lens treats it |
| --- | --- |
| `span`, `event` | General trace activity |
| `generation`, `embedding` | Model activity, including supported model, payload, usage, and cost attributes |
| `agent`, `tool`, `chain`, `retriever` | Typed steps in the trace hierarchy |
| `evaluator`, `guardrail` | Typed trace observations with their exported status |

An `evaluator` or `guardrail` observation remains part of the trace. Its presence does not create a Lens evaluation run or evaluation result. Lens’s native evaluation workflow uses its own evaluation telemetry contract.

## Supported generation data

For 6.0.2 `generation` observations, Lens normalizes the following when the Langfuse processor exports them:

- Model name.
- Input and output payloads.
- Input, cached-input, output, and total token counts.
- Reported input, output, and total costs.
- Status and status message.
- Observation timing and hierarchy.

Lens does not estimate unreported usage. Missing token fields normalize to zero; total cost can be derived arithmetically from reported cost buckets. Zero defaults are not proof of zero actual usage, and ingestion does not reconstruct missing model payloads.

## Not supported as Langfuse APIs

Only the OTLP trace ingestion contract above is covered. Do not assume Lens implements another endpoint just because the Langfuse SDK normally calls it.

In particular:

- Lens does not provide Langfuse media storage or its media upload APIs.
- Langfuse management APIs are outside this integration.
- Langfuse-specific product operations that use non-OTLP endpoints are outside this integration.
- Older SDK generations that export through a different Langfuse ingestion protocol are not covered.

Keep media upload disabled:

```dotenv
LANGFUSE_MEDIA_UPLOAD_ENABLED=false
```

Disabling media upload prevents the SDK from calling an unsupported media service. It does not redact URLs, text, base64 values, or other content already embedded in trace attributes. Configure instrumentation capture according to your privacy and retention requirements.

## Endpoint rules

Set `LANGFUSE_BASE_URL` to the Lens application origin:

```dotenv
LANGFUSE_BASE_URL=https://lens.example.com
```

Do not set it to the full OTLP path. The 6.0.2 processor appends `/api/public/otel/v1/traces` and sends Basic authentication automatically.

The public and secret keys must belong to the same active Lens project key. A revoked key, a deleted project, or an inactive project cannot ingest traces.

## Data handling in Lens

Lens applies the project’s retention period at ingestion. It also redacts known sensitive attribute names, including authorization and cookie headers, connection strings, and attribute keys ending in common credential names such as `api_key`, `access_token`, `password`, or `secret`.

This attribute-key redaction is not a substitute for application-side capture controls. Prompts, completions, tool arguments, or arbitrary nested payload fields can still contain sensitive data. Decide what the Langfuse instrumentation may export before pointing production traffic at Lens.

## Delivery and shutdown limits

OpenTelemetry processors may batch spans in memory:

- `observation.end()` closes the observation but does not guarantee delivery.
- `await processor.forceFlush()` asks the active processor to export buffered spans.
- `await sdk.shutdown()` flushes and shuts down the telemetry SDK.

Use `forceFlush()` only when the SDK must remain usable. Use `shutdown()` once at a process lifecycle boundary. A process that exits without either can lose its final batch even though all observations were ended correctly.

Lens returns success after accepting and queueing valid normalized spans. The trace may take a short time to become visible while the ingestion worker persists the batch.

## When to use the native Lens integration

Prefer the native Anvia Lens integration when you need Anvia-aware tracing plus Lens evaluation runs, managed datasets, comparisons, and quality gates. Use Langfuse compatibility when preserving existing 6.0.2 trace instrumentation is the priority.

For setup, continue with [Connect existing instrumentation](./connect-existing-instrumentation.md).
