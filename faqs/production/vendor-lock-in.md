# How does Anvia reduce vendor lock-in?

Anvia places provider-neutral contracts around common capabilities, but it cannot make different models or infrastructure services behaviorally identical.

## Portable boundaries

- Agents depend on completion-model contracts rather than a provider client.
- Messages, tool calls, usage, and streaming events use normalized shapes.
- Embedding, media, memory, vector, and observer contracts have replaceable adapters.
- Application tools remain ordinary TypeScript functions.
- Pipelines remain callable application code.
- Observability can target Lens, Langfuse, or an OpenTelemetry pipeline through the corresponding integration.

## What remains provider-specific

- Available models and regions.
- Tool-choice behavior and structured-output fidelity.
- Reasoning controls and provider parameters.
- Context limits, prices, latency, and rate limits.
- Image, audio, transcription, OCR, and embedding features.
- Stored schemas, vector-index configuration, and infrastructure operations.

Provider-neutral code reduces the size of a migration; it does not remove the need to evaluate the replacement model with real application cases.

Keep provider construction at one application boundary, avoid leaking raw provider responses through product code, and maintain a small live capability suite. See [the model boundary](/sdk/providers/model-boundary), [choose a provider](/sdk/providers/choose-a-provider), and [capability matrix](/sdk/providers/capability-matrix).
