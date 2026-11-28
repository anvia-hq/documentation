# Releases

The reviewed source release is `@anvia/core` **1.24.1**. The source changelog is authoritative; the
entries below summarize recent v1 changes and preserve notable v0 compatibility milestones.

## Changes in 1.24.1

Reviewed `1.24.0` → `1.24.1` against SDK source on 2026-11-28. LLM judges no longer send `temperature: 0`: `runJudge()` omits `temperature` unless set, and `llmJudge`, `llmScore`, the advanced judge metrics, and `createJudgeMetrics` accept an opt-in `temperature`. `CompletionModelCapabilities` gains an optional `temperature` flag; a request that sets `temperature` on a model declaring `temperature: false` fails with `CompletionCapabilityError`. `ExtractionError` and `EvalOutcome.fromError()` reasons include the underlying cause message, `extract()` no longer retries non-retryable 4xx HTTP errors, and `fromError()` infers `kind: "provider"`, `"configuration"`, or `"timeout"` when no kind is passed. `defineEvalSuite` tuple typing also works under TypeScript 7. See [Evaluations](/sdk/evaluations).

## Changes in 1.24.0

Reviewed `1.23.0` → `1.24.0` against SDK source on 2026-11-26. Adds a `skills` segment to the context breakdown (skill catalog instructions, skill tool definitions, and loaded skill tool results) and surfaces `contextBreakdown` end to end: on `AgentOutcome`, streaming `turn_end` events, and assistant generation metadata. `@anvia/core/context` adds `skillInstructions`, `skillToolNames`, `CONTEXT_SEGMENT_IDS`, and `isContextBreakdown`, and `Agent` detects skills automatically. See [Context](/sdk/agents/context). Version `1.23.0` added the RAG, vector, and knowledge-graph developer-experience defaults documented in the SDK guides.

## Changes in 1.22.0

Reviewed `1.21.1` → `1.22.0` against SDK source on 2026-11-23. Adds the evaluation developer-experience release: case `passed` and `metricSummaries`, case tags, multi-trial runs (`trials`, `pass@k`, `minPassRate`), target caching (`createMemoryEvalCache`, `createFileEvalCache`, `cachedEvalTarget`), metric shorthands, `createJudgeMetrics`, agent trajectory and budget metrics, `runEvalCli` flag parsing with `--failed-only`, baseline comparison and dataset loading, and a bare-agent `agentEvalTarget(agent)` short form for string prompts.

## Changes in 1.21.1

Reviewed `1.17.3` → `1.21.1` against SDK source on 2026-11-23. Adds the context token breakdown, `searchTool()`, tool `examples`, compact embedding text, `handler` (deprecating `execute`), per-turn `toolConcurrency`, and PEM/AWS redaction patterns; aligns provider model IDs and durable protocol 5.

## Changes through 1.17.3

Reviewed `1.9.0` → `1.17.3` against SDK source on 2026-11-04. Added OpenAI Decisions and typed refusal errors (1.10), active-loop compaction and broader credential redaction (1.11), summary temperature omission (1.11.1), question-tool defaults and input limits (1.12), durable steering protocol 4 (1.13), observer failure reporting (1.14), replay-aware durable tracing (1.14.1), Pipeline decision and route stages (1.15), richer vector metrics and filters (1.16), model-listing metadata (1.17.0 and 1.17.1), and bounded media estimates plus optional compaction temperature (1.17.3). See [Decisions](/sdk/decisions), [compaction](/sdk/memory/compaction), [observability](/sdk/observability), and [Pipeline decisions and routing](/sdk/pipelines/decisions-and-routing).

See the [source changelog](https://github.com/anvia-hq/anvia/blob/dd0dec5c0458547409cf04a701fe1dc3d8530e3f/packages/core/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.24.1` | Judges omit `temperature` unless set (new opt-in `temperature` on judge metrics); `temperature` capability validation; cause messages and inferred `provider`/`configuration`/`timeout` kinds in `EvalOutcome.fromError()`; no `extract()` retries for non-retryable 4xx errors; TypeScript 7 suite typing. |
| `1.24.0` | Added the `skills` context-breakdown segment, `CONTEXT_SEGMENT_IDS`, `isContextBreakdown`, and `contextBreakdown` on `AgentOutcome`, `turn_end` events, and generation metadata. |
| `1.23.0` | Added progressive RAG defaults (recursive chunking, `embedDocuments` overloads, filter shorthand, default `topK`, `rerank`, `ContextSource`, `createVectorIndex()`), `VectorStore.delete()`, and graph-ingestion and retrieval defaults. |
| `1.17.3` | Bounded inline image and file base64 at about 2,000 tokens per payload in `estimateMemoryTokens()`, so one attachment no longer triggers premature compaction. `createSummaryMemoryCompactor()` sends no `temperature` unless set; use `temperature: 0` for deterministic summaries. Summary-request failures now include the provider message in the error, while accumulated usage remains available on `usage`. See [compaction](/sdk/memory/compaction). |
| `1.17.2` | Updated upstream runtime dependencies, including Anthropic 1.x and Mistral 3.x SDKs, raised the `zod` peer floor to `^4.6.7`, and adapted `@anvia/jev` to TypeSafe SDK 0.7. |
| `1.17.1` | Durable sessions continue from started failed or cancelled runs and carry settled progress into the next run's history. OpenAI model listings preserve advertised `pricing` metadata, and in-memory vector `inspect` rejects invalid cursors with `RangeError`. See [`@anvia/durable`](/packages/durable). |
| `1.17.0` | Model listings expose provider-advertised `supportedParameters` and provider-specific `reasoning` metadata. The single-consumer `AgentStream` final-promise contract was clarified. See [model listing](/sdk/providers/openai/model-listing). |
| `1.16.0` | `InMemoryVectorStore` gained a `metric` option (`cosine` by default, plus `euclidean` and `dotProduct`), and `VectorFilter` gained `ne`, `in`, `gte`, and `lte` with variadic `and`/`or`, translated natively where a backend supports them and rejected with a descriptive error otherwise. Empty or whitespace-only tool-call arguments are treated as `{}`. |
| `1.15.0` | Added Pipeline `.decide()` and `.route()` stages for typed decisions, and graph branch nodes report `branchOf` (`parallel` or `route`). See [Pipeline decisions and routing](/sdk/pipelines/decisions-and-routing). |
| `1.9.0` | Added provider-neutral typed decisions through `@anvia/core/decision` (also exported from the Core root): choice, multi-label, rubric score, and boolean-probability questions, validated execution, and ordered batches with retries and cancellation. See [Typed decisions](/sdk/decisions). |
| `1.8.0` | Added opt-in durable agent streaming with persisted generation deltas, unique model-attempt identities, and validated streamed response checkpoints; durable execution protocol moved to version 2. See [`@anvia/durable`](/packages/durable). |
| `1.7.0` | Added the execution boundaries and stable tool operation IDs that back experimental durable agent execution, preserving direct agent behavior. |
| `1.7.1` | Retained empty or encrypted Responses reasoning that arrives only in the final streamed response (including Azure Responses) and let final encrypted details enrich matching streamed reasoning for replay on later turns. |
| `1.6.1` | Refreshed package READMEs with concise overviews and links to detailed guides. |
| `1.6.0` | Added opt-in `errorSerialization: 'anvia'` for `toReadableStream`, which writes a minimized terminal error envelope. Forwarded evaluation case cancellation through agent targets, approvals, embeddings, and judge retries. Cancelled built-in skill scripts with their tool invocation. Validated embedding counts for every provider batch, preserved terminal stream metadata for empty terminal choices, and copied Standard Schema converter data before strict-object refinement. |
| `1.5.1` | Bounded tool results in memory-compaction prompts: tool output is truncated to 2,000 characters with a `[truncated N chars]` marker, like inline file text. |
| `1.5.0` | Added deterministic `recentTurns` memory-compaction retention. Omitted retention now keeps one complete user-led turn instead of 25% of `afterTokens`; deprecated `recentTokens` remains available as an explicit migration path. |
| `1.4.0` | Centralized PII redaction in `@anvia/core/redaction` for Lens and Langfuse, with safer card and phone matching, bounded traversal, circular-reference handling, bearer-token detection, and broader key-prefix defaults. |
| `1.3.2` | Clarified the default think-tool description to encourage step-by-step planning and reassessment. |
| `1.3.1` | Updated runtime dependencies and raised schema peer floors to Zod `^4.6.5` and optional `@valibot/to-json-schema` `^1.8.0`. |
| `1.3.0` | Accepted any Standard Schema as the `outputSchema` of `generateCompletion` and `streamCompletion`: Zod keeps its behavior, Valibot works end to end with the optional `@valibot/to-json-schema` peer, and other libraries are supported through `~standard.jsonSchema` (schemas without conversion support fail before any model call). Transformed schemas are supported with the input representation sent to providers; validation runs synchronously through `~standard.validate`, so async schemas are rejected with `CompletionStructuredOutputError`. Exported `StandardSchemaV1`, `StandardJSONSchemaV1`, and `isStandardSchema`. Agent output schemas, extractors, and tool schemas remain Zod-only. |
| `1.2.2` | Sanitized tool error messages returned to the model: only the error name and message are forwarded, never stack traces, file paths, or other data carried by custom Error subclasses. |
| `1.2.1` | Preserved error diagnostics in `toReadableStream` error lines: well-known fields such as `code` and `details` are copied explicitly, and non-JSON-safe thrown values degrade to a `{ message }` payload instead of serializing as `{}`. |
| `1.2.0` | Added `AgentTeam` for coordinator-led collaboration between Agent definitions, with dynamic instances, attributed messaging, retained follow-ups, streaming, steering, and shared limits — plus opt-in sibling communication and recursive spawning. Registered AgentTeam targets in Studio with attributed JSONL team runs (`agent_queued` events included). Preserved ESM module boundaries for tree shaking and omitted stack traces from `toReadableStream` error events. |
| `1.1.2` | Moved `zod` to `peerDependencies` (`^4.4.0`) in packages that expose zod types in their public API, so consumers compile and run against a single shared zod copy instead of installing a second, potentially conflicting dependency. |
| `1.1.1` | Bumped upstream runtime dependencies to their latest versions and aligned zod to 4.5.4 across all packages and workspaces. |
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
- Replace message-count compaction thresholds with `afterTokens` and `recentTurns`; use deprecated `recentTokens` only while migrating an existing token-budget policy. Use `agent.compactMemory({ session })` for explicit maintenance.
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
