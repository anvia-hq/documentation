# Can Lens observe applications that do not use Anvia?

Yes, through the documented Langfuse v5 OpenTelemetry compatibility path. Lens does not automatically instrument arbitrary applications, and the native `@anvia/lens` adapter only observes Anvia runs to which it is attached.

For a non-Anvia Node.js application already using `@langfuse/otel` and `@langfuse/tracing` v5, point its `LangfuseSpanProcessor` at the Lens origin with a Lens project key. Lens accepts the supported OTLP trace batch, normalizes the Langfuse observation types, and retains exported hierarchy, timing, status, model, usage, cost, session, user, environment, and release fields when they are present.

The integration does not infer missing data. If instrumentation does not export token counts, model payloads, session IDs, or user IDs, Lens cannot reconstruct them. Ordinary application work must also be instrumented before it appears; connecting an exporter is not automatic code instrumentation.

The current compatibility contract is intentionally narrower than universal OTLP or Langfuse API compatibility:

- It covers the v5 Langfuse OTLP trace endpoint and supported observation attributes.
- It does not cover older Langfuse ingestion protocols.
- It does not implement Langfuse media, management, or other non-OTLP APIs.
- It does not turn trace evaluator observations into Lens evaluation runs.

Follow [Connect existing Langfuse instrumentation](/lens/connect/langfuse/connect-existing-instrumentation) and read [compatibility limits](/lens/connect/langfuse/compatibility-limits). For Anvia agents, use [the native adapter](/lens/connect/anvia) instead.
