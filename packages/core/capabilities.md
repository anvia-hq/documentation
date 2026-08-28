# Capabilities

Core is split into focused package entry points. The root export contains common authoring APIs; advanced and environment-specific APIs remain on subpaths.

| Capability | Entry point | Package responsibility |
| --- | --- | --- |
| Agents | `@anvia/core/agent` | Bounded model/tool loops, sessions, typed interactions and continuations, observability, dynamic context, agent-as-tool |
| Completions | `@anvia/core/completion` | Provider-neutral requests, streams, messages, usage, documents, structured parsing |
| Tools | `@anvia/core/tool` | Zod validation, approvals, structured questions, middleware, dynamic discovery, result normalization |
| Documents | `@anvia/core/documents` | Shared text-document records and deterministic single/batch text chunking |
| Lifecycle | `@anvia/core/agent` | Typed run, turn, generation, tool, finish, and error observation |
| Guardrails | `@anvia/core/guardrails` | Input/final-output allow, block, and rewrite policies |
| Memory | `@anvia/core/memory` | Conversation store, inspection, save policy, durable compaction contracts |
| Retrieval | `@anvia/core/embeddings`, `@anvia/core/vector-store` | Raw-text ingestion, dense/sparse embedding helpers, filters, in-memory search, search-tool contracts |
| Pipelines | `@anvia/core/pipeline` | Typed composition, parallel branches, batch execution, graphs, run observers |
| Extraction | `@anvia/core/extractor` | Agent-backed schema extraction with retry support |
| Media | `@anvia/core/image-generation`, `speech-generation`, `transcription` | Provider-neutral helpers and model interfaces |
| MCP registration and skills | `@anvia/core/mcp`, `@anvia/core/skills` | Lightweight MCP server/tool contracts and validated local skill loading |
| Observability | `@anvia/core/observability` | Run, generation, tool, trace, and streaming observer contracts |
| Evaluations | `@anvia/core/evals` | Cases, metrics, suites, reporters, traces, CLI results, cost/usage totals |
| Browser-safe interactions | `@anvia/core/agent/interactions` | JSON-safe approval/question contracts, assertions, and parsers without loading the Agent runtime |

## Capability boundaries

Core does not call a model without an injected model implementation. It does not ship durable database or vector infrastructure, authenticate users, authorize tools, schedule background jobs, or host a browser UI.

Provider support also varies. A completion adapter may not implement embeddings, images, audio, transcription, model listing, provider tools, or every structured-output feature. Use the [provider capability matrix](/sdk/providers/capability-matrix) before assuming parity.

MCP connections and transports live in the optional Node.js package [`@anvia/mcp`](/packages/mcp).
Client messages, the framed wire protocol, and UI conversion live in
[`@anvia/client`](/packages/client). Core's document helpers accept app-supplied text and do not
discover, read, or parse files. Local skill loading still belongs on a server with filesystem access;
`ReadableStream` helpers need Web Streams support.

For exact exports, see the [API reference](/packages/core/api-reference). For composition guidance, use [architecture](/packages/core/architecture) and [patterns](/packages/core/patterns).
