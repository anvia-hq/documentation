# Capabilities

Core is split into focused package entry points. The root export contains common authoring APIs; advanced and environment-specific APIs remain on subpaths.

| Capability | Entry point | Package responsibility |
| --- | --- | --- |
| Agents | `@anvia/core/agent` | Bounded model/tool loops, sessions, observability, dynamic context, agent-as-tool |
| Completions | `@anvia/core/completion` | Provider-neutral requests, streams, messages, usage, documents, structured parsing |
| Tools | `@anvia/core/tool` | Zod validation, approvals, middleware, dynamic discovery, result normalization |
| Lifecycle | `@anvia/core/agent` | Typed run, turn, generation, tool, finish, and error observation |
| Guardrails | `@anvia/core/guardrails` | Input/final-output allow, block, and rewrite policies |
| Memory | `@anvia/core/memory` | Conversation store, inspection, save policy, durable compaction contracts |
| Retrieval | `@anvia/core/embeddings`, `@anvia/core/vector-store` | Dense/sparse embedding helpers, filters, in-memory search, search-tool contracts |
| Pipelines | `@anvia/core/pipeline` | Typed composition, parallel branches, batch execution, graphs, run observers |
| Extraction | `@anvia/core/extractor` | Agent-backed schema extraction with retry support |
| Media | `@anvia/core/image-generation`, `speech-generation`, `transcription` | Provider-neutral helpers and model interfaces |
| MCP and skills | `@anvia/core/mcp`, `@anvia/core/skills` | MCP transports/tool discovery and validated local skill loading |
| Observability | `@anvia/core/observability` | Run, generation, tool, trace, and streaming observer contracts |
| Evaluations | `@anvia/core/evals` | Cases, metrics, suites, reporters, traces, CLI results, cost/usage totals |
| UI protocol | `@anvia/core/ui` | UI messages, stream events, resume cursors, Core/UI conversion |

## Capability boundaries

Core does not call a model without an injected model implementation. It does not ship durable database or vector infrastructure, authenticate users, authorize tools, schedule background jobs, or host a browser UI.

Provider support also varies. A completion adapter may not implement embeddings, images, audio, transcription, model listing, provider tools, or every structured-output feature. Use the [provider capability matrix](/sdk/providers/capability-matrix) before assuming parity.

Some entry points have additional runtime requirements. MCP `stdio`, local skill loading, and file/PDF loading belong on a server with process or filesystem access. `ReadableStream` helpers need Web Streams support.

For exact exports, see the [API reference](/packages/core/api-reference). For composition guidance, use [architecture](/packages/core/architecture) and [patterns](/packages/core/patterns).
