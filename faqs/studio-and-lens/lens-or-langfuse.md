# Should I use Lens or Langfuse?

Choose based on the workflows you need and the instrumentation you already operate. Lens is not a complete drop-in replacement for the Langfuse service, and an existing Langfuse deployment does not need to be removed merely to adopt Anvia.

Lens is a natural choice when you want the native Anvia adapter together with retained traces, evaluation reporting, managed datasets, [prompt management](/lens/prompts), release comparisons, quality gates, and [notification channels](/lens/observability/alerts/channels) in one self-hosted workspace. [MCP access](/lens/workspace/mcp-access) exposes read-only diagnostics to assistants.

Langfuse is a strong choice when your team already depends on its observability ecosystem or its prompt, scoring, dataset, and experiment workflows. Anvia supports those workflows through [`@anvia/langfuse`](/packages/langfuse), including tracing, evaluation reporting, datasets, experiments, prompt retrieval, and scoring.

The products can coexist in a broader stack, but compatibility has a specific boundary. Lens can receive the supported OTLP trace format emitted by `@langfuse/otel` (the current Lens contract test resolves 6.0.2), normalize supported observation attributes, and preserve trace hierarchy. That path is useful when existing Langfuse instrumentation should be viewed in Lens.

It does not make Lens an implementation of every Langfuse API. Lens does not provide Langfuse media storage, management APIs, or non-OTLP product endpoints. Langfuse evaluator and guardrail observations remain trace observations in Lens; they do not automatically create native Lens evaluation runs.

For a new Anvia application using Lens evaluations, prefer the [native Lens integration](/lens/connect/anvia). To preserve supported Langfuse OTLP instrumentation, use [Lens's Langfuse connection](/lens/connect/langfuse) and review the [compatibility limits](/lens/connect/langfuse/compatibility-limits) before changing a production endpoint.

## Sources and review

Reviewed on 2026-11-23 against [Lens v0.20.0 source](https://github.com/anvia-hq/lens/tree/b06101f36392d4b1bab5a1b69a53d29e67fc22f5) and the [reviewed Anvia Langfuse adapter](https://github.com/anvia-hq/anvia/tree/e751560f4a02c8989928966c203ed8747c0072fb/packages/observability-langfuse). For Langfuse's own workflows, use its official [observability](https://langfuse.com/docs/observability/overview), [prompt management](https://langfuse.com/docs/prompt-management/overview), and [evaluation](https://langfuse.com/docs/evaluation/overview) documentation. This comparison is a workflow guide, not a live compatibility or deployment test.
