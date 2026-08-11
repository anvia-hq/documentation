# Should I use Lens or Langfuse?

Choose based on the workflows you need and the instrumentation you already operate. Lens is not a complete drop-in replacement for the Langfuse service, and an existing Langfuse deployment does not need to be removed merely to adopt Anvia.

Lens is a natural choice when you want the native Anvia adapter together with retained traces, Anvia evaluation reporting, managed datasets, release comparisons, and quality gates in one self-hosted workspace.

Langfuse is a strong choice when your team already depends on its observability ecosystem or its prompt, scoring, dataset, and experiment workflows. Anvia supports those workflows through [`@anvia/langfuse`](/packages/langfuse), including tracing, evaluation reporting, datasets, experiments, prompt retrieval, and scoring.

The products can coexist in a broader stack, but compatibility has a specific boundary. Lens can receive the OTLP trace format emitted by `@langfuse/otel` v5, normalize supported observation attributes, and preserve trace hierarchy. That path is useful when existing Langfuse instrumentation should be viewed in Lens.

It does not make Lens an implementation of every Langfuse API. Lens does not provide Langfuse media storage, management APIs, or non-OTLP product endpoints. Langfuse evaluator and guardrail observations remain trace observations in Lens; they do not automatically create native Lens evaluation runs.

For a new Anvia application using Lens evaluations, prefer the [native Lens integration](/lens/connect/anvia). To preserve existing Langfuse v5 trace instrumentation, use [Lens's Langfuse connection](/lens/connect/langfuse) and review the [compatibility limits](/lens/connect/langfuse/compatibility-limits) before changing a production endpoint.
