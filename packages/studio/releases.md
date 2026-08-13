# Releases

The current source manifest is `@anvia/studio` **0.7.54**. Studio releases often track compatible Core, Server, React, and React UI updates.

| Version | Summary |
| --- | --- |
| `0.7.54` | Updated React, Server, and React UI dependencies for Core `0.26.0` compatibility. |
| `0.7.53` | Published updated upstream runtime dependencies. |
| `0.7.52` | Adopted richer evaluation result, totals, usage/cost, negative-control, and optional Lens environment handling. |
| `0.7.49` | Adopted model-aware context usage across the Studio client stack. |
| `0.7.38` | Preserved authoritative usage on failed runs and child-agent failures in Studio traces. |
| `0.7.37` | Adopted lifecycle-driven transcript smoothing and stable-block Markdown. |
| `0.7.36` | Added automatic transient completion retries for buffered and pre-output streaming runs. |
| `0.7.35` | Added durable per-generation provider/model/token metrics and memory-adapter conversation inspection. |
| `0.7.34` | Added read-only sandbox inspection, managed `serve()` cleanup, cancellable streams, partial transcript persistence, and cancelled human-input states. |
| `0.7.29` | Preserved strict JSON message metadata in SQLite session storage. |
| `0.7.16` | Redesigned Knowledge, Memory, and Status; added MCP origin and direct MCP tool execution; accepted shared UI-style requests. |
| `0.6.0` | Added multi-provider model selection and multimodal attachments. |
| `0.5.9` | Made in-memory storage the default and preserved agent-owned memory stores. |

## Upgrade checks

- Align the compatible Core peer and Studio's Server/React/React UI dependencies.
- Back up local SQLite files before a version change when their data matters.
- Re-test custom stores against current public store contracts.
- Review route and UI-option behavior when embedding Studio in another server.
- Re-test tool approvals, cancellation, model policy, and custom client scripts.

Read the complete [Studio changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-studio/CHANGELOG.md).
