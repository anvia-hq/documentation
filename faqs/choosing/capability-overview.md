# What capabilities does Anvia provide?

Anvia provides runtime primitives for model calls and the application behavior around them. Capabilities are split across Core, provider packages, infrastructure adapters, and optional product surfaces.

| Need | Anvia surface |
| --- | --- |
| One model request | [Completions](/sdk/completions) |
| Reusable multi-turn behavior | [Agents](/sdk/agents) |
| Application actions | [Tools](/sdk/tools) |
| Typed model data | [Structured output](/sdk/structured-output) |
| Conversations across requests | [Memory](/sdk/memory) |
| Document retrieval | [Knowledges](/sdk/knowledges) |
| Explicit multi-stage workflows | [Pipelines](/sdk/pipelines) |
| Incremental responses | [Streaming](/sdk/streaming) |
| Images, audio, transcription, and OCR | [Models](/sdk/models) |
| External MCP tools | [MCP](/sdk/advanced/mcp) |
| Local inspection | [Studio](/studio/) |
| Production observability and evaluation | [Lens](/lens/) |

Availability is not uniform across every provider and runtime. A package implementing completion models may not implement embeddings, images, audio, OCR, or model listing. Tool-call semantics and structured-output support can also differ by model.

Use the [provider capability matrix](/sdk/providers/capability-matrix) for model-facing support and the [package feature matrix](/packages/feature-matrix) for package-level compatibility. Check each package's API reference for exact public exports rather than assuming a capability from its name.
