# Releases

The current source manifest is `@anvia/core` **1.0.0-rc.2**. The source changelog is authoritative; the entries below preserve notable v0 compatibility milestones.

| Version | Summary |
| --- | --- |
| `1.0.0-rc.2` | Prepared the synchronized Anvia 1.0 package train for its first public release candidate. |
| `0.26.0` | Hardened MCP HTTP and SSE connections against SSRF, including DNS rebinding, redirects, and OAuth metadata requests; custom transport fetch implementations are rejected. |
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
- Re-run type checking and tests for tool calls, streams, memory persistence, and custom observers after a Core upgrade.
- Check whether new provider-neutral fields require adapter updates even when application code does not use them directly.

Read the complete [Core changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/core/CHANGELOG.md) and verify the installed version with your package manager before applying migration assumptions.
