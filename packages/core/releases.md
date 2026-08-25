# Releases

The current stable release is `@anvia/core` **1.0.3**. The source changelog is authoritative; the
entries below summarize recent v1 changes and preserve notable v0 compatibility milestones.

| Version | Summary |
| --- | --- |
| `1.0.3` | Added shared text-document contracts and consistent raw-text ingestion helpers for vector stores and managed knowledge graphs, including reusable graph/vector chunk embeddings. |
| `1.0.2` | Reported cancelled Agent runs explicitly so observers can finalize them before an observability provider shuts down. |
| `1.0.1` | Refreshed supported upstream SDK and runtime dependencies and removed the FastEmbed package. |
| `1.0.0` | Made `pdfjs-dist` an optional peer; moved MCP clients and transports to `@anvia/mcp`; replaced Agent status/final wrappers with explicit outcomes and a stream handle; added token-aware automatic and manual memory compaction; finalized typed interactions, document utilities, and Streamable HTTP security boundaries. |
| `1.0.0-rc.9` | Prepared the synchronized Anvia 1.0 package train and replaced legacy MCP connection factories with lifecycle-owning clients supporting `stdio`, `streamableHttp`, and `custom` transports. |
| `0.26.0` | Hardened the legacy remote MCP connection layer against SSRF, including DNS rebinding, redirects, and OAuth metadata requests. |
| `0.25.1` | Published updated upstream runtime dependencies. |
| `0.25.0` | Expanded evaluation CLI handling, deterministic and abstention metrics, totals, score direction, usage/cost aggregation, negative controls, and richer typed suite/reporting contracts. |
| `0.24.0` | Added evaluation run identity and lifecycle reporting for grouped Lens runs, comparisons, and quality gates. |
| `0.23.0` | Added provider-neutral LLM and deterministic evaluation metrics, trace references, Langfuse experiment scores, and OpenTelemetry evaluation events. |
| `0.22.0` | Added model-aware context limits and active context usage across responses, streams, sessions, and UI protocol events. |
| `0.21.0` | Added the shared resumable-stream request cursor used by Server and React. |
| `0.20.0` | Added sparse embedding contracts and hybrid embedding helpers. |
| `0.19.0` | Removed deprecated middleware and hook aliases; applications must use the current middleware, hook, and tool-output names. |
| `0.18.0` | Added opt-in durable memory compaction with atomic conflict detection and aggregate usage accounting. |

## Upgrade checks

- Read every minor-version entry crossed by the upgrade; pre-1.0 minor releases can contain meaningful contract changes.
- If upgrading from before `0.19.0`, replace removed hook and middleware aliases before updating.
- Upgrade provider, memory, vector, Server, and React packages together when their changelogs reference the new Core version.
- Switch on Agent outcome `type`: `response`, `interaction`, or `blocked`. Use `agent.resume(continuation, response)` or pass the same continuation and response to `agent.stream(...)`.
- Replace wrapped Agent `final` event handling with direct terminal outcome events. Choose one `AgentStream` surface: full events, `textStream`, `text`, or `result`.
- Replace message-count compaction thresholds with `afterTokens` and `recentTokens`; use `agent.compactMemory({ session })` for explicit maintenance.
- Move file discovery and reads out of Core document helpers; pass text to `chunkText()` and PDF bytes plus an explicit page range to `extractPdfText()`.
- Prefer `chunkTextDocuments()` for stable batch chunk IDs and `ingestVectorText()` or
  `ingestVectorDocuments()` for the common raw-text vector path.
- Install `pdfjs-dist` directly when the application calls `extractPdfText()`; omit it when only text chunking is used.
- Import `McpClient` and `McpClientGroup` from `@anvia/mcp`, not `@anvia/core/mcp`.
- Keep Streamable HTTP `ssrfProtection` at its default `'strict'`; use `'disabled'` only for a fixed, application-trusted local or private endpoint.
- Replace Streamable HTTP `requestInit.headers` with the explicit `headers` string record. Do not attempt to override transport-owned protocol fields or combine static `Authorization` with `authProvider`.
- Re-run type checking and tests for tool calls, streams, memory persistence, and custom observers after a Core upgrade.
- Check whether new provider-neutral fields require adapter updates even when application code does not use them directly.

Read the complete [Core changelog](https://github.com/anvia-hq/anvia/blob/main/packages/core/CHANGELOG.md) and verify the installed version with your package manager before applying migration assumptions.
