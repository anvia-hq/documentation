# What capabilities does Anvia provide?

Anvia provides runtime primitives for model calls and the application behavior around them. Capabilities are split across Core, provider packages, infrastructure adapters, and optional product surfaces.

| Need | Anvia surface |
| --- | --- |
| One model request | [Completions](/sdk/completions) |
| Reusable multi-turn behavior | [Agents](/sdk/agents) |
| Application actions | [Tools](/sdk/tools) |
| Large tool catalogs | [Dynamic tools](/sdk/advanced/dynamic-tools) |
| Reusable procedures | [Skills](/sdk/advanced/skills) |
| Typed model data | [Structured output](/sdk/structured-output) |
| Labels, scores, and probabilities to branch on | [Typed decisions](/sdk/decisions) |
| Input and output policy | [Guardrails](/sdk/guardrails) |
| Conversations across requests | [Memory](/sdk/memory) |
| Document retrieval | [Knowledges](/sdk/knowledges) |
| Knowledge-graph retrieval | [Graph RAG](/sdk/knowledges/graph-rag) |
| Explicit multi-stage workflows | [Pipelines](/sdk/pipelines) |
| Coordinating specialist agents | [Multi-agent](/sdk/advanced/multi-agent) |
| Agent runs that survive a restart (experimental) | [Durable execution](/sdk/advanced/durable-execution) |
| Incremental responses | [Streaming](/sdk/streaming) |
| Images, audio, transcription, and OCR | [Models](/sdk/models) |
| External MCP tools | [MCP](/sdk/advanced/mcp) |
| Isolated workspaces and desktops | [Sandbox](/sdk/advanced/sandbox) |
| Evaluation suites | [Evaluations](/sdk/evaluations) |
| Discord, Slack, and Telegram | [Channels](/channels/) |
| Local inspection | [Studio](/studio/) |
| Production observability and evaluation history | [Lens](/lens/) |

Availability is not uniform across every provider and runtime. A package implementing completion models may not implement embeddings, images, audio, OCR, or model listing. Tool-call semantics and structured-output support can also differ by model.

Use the [provider capability matrix](/sdk/providers/capability-matrix) for model-facing support and the [package feature matrix](/packages/feature-matrix) for package-level compatibility. Check each package's API reference for exact public exports rather than assuming a capability from its name. The feature overviews, starting with the [agent runtime](/features/agent-runtime), summarize each capability.
