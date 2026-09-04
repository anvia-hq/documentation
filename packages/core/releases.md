# Releases

The current stable release is `@anvia/core` **1.1.0**. The source changelog is authoritative; the
entries below summarize recent v1 changes and preserve notable v0 compatibility milestones.

| Version | Summary |
| --- | --- |
| `1.0.10` | Enforced the exact `maxTurns` boundary in the Agent execution loop; runs now stop after the configured turn limit instead of allowing extra completion attempts. |
| `1.0.9` | Added typed completion model controls with provider-neutral reasoning effort support, Agent defaults, per-run overrides, Studio selectors and persistence, and normalized observability attributes. |
| `1.0.8` | Improved evaluation developer experience with structural exact matching, explicit target status, structured invalid errors, per-case timing/usage/cost diagnostics, typed case requirements and CI expectations, progress events, timeouts, abort signals, independent target and metric concurrency, filtering, sharding, fail-fast execution, and rerun case selection. |
| `1.0.7` | Preserved canonical memory messages during compaction and stored the latest summary as a separate model-context checkpoint; memory loads and inspection remain fully replayable, and compacted model requests receive the summary plus only the unsummarized tail. |
| `1.0.6` | Removed Core's local PDF text extraction API and its optional `pdfjs-dist` peer dependency. Applications now select and operate their own parser or OCR service before passing normalized text to Core; provider PDF attachments remain supported. |
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
- Keep file discovery, reads, parsing, and OCR in the application; pass normalized text to
  `chunkText()` or `chunkTextDocuments()`.
- Prefer `chunkTextDocuments()` for stable batch chunk IDs and `ingestVectorText()` or
  `ingestVectorDocuments()` for the common raw-text vector path.
- Remove application installs of `pdfjs-dist` that existed only for Core's former PDF extractor.
  Keep any parser dependency that the application uses directly.
- Import `McpClient` and `McpClientGroup` from `@anvia/mcp`, not `@anvia/core/mcp`.
- Keep Streamable HTTP `ssrfProtection` at its default `'strict'`; use `'disabled'` only for a fixed, application-trusted local or private endpoint.
- Replace Streamable HTTP `requestInit.headers` with the explicit `headers` string record. Do not attempt to override transport-owned protocol fields or combine static `Authorization` with `authProvider`.
- Re-run type checking and tests for tool calls, streams, memory persistence, and custom observers after a Core upgrade.
- Check whether new provider-neutral fields require adapter updates even when application code does not use them directly.
- Pass typed completion model controls through `AgentOptions.controls` or per-run `controls`; Core rejects control values the selected model does not support.

Read the complete [Core changelog](https://github.com/anvia-hq/anvia/blob/main/packages/core/CHANGELOG.md) and verify the installed version with your package manager before applying migration assumptions.
