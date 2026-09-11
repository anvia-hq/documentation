# Releases

The current stable release is `@anvia/studio` **1.2.1**. The entries below summarize recent v1
changes and preserve notable v0 Studio milestones.

| Version | Summary |
| --- | --- |
| `1.2.1` | Dependency-only release following Core, Client, Server, and graph package updates. |
| `1.2.0` | Added a team playground with live instance trees, coordinator follow-ups, member conversations and tool activity, inter-agent messages, and attributed approval and question controls. Registered AgentTeam targets with attributed JSONL team runs, coordinator steering, cancellation, and application-only interaction responses, emitting `agent_queued` events before instances acquire a concurrency slot. |
| `1.1.1` | Bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to Core, Graph, React, React UI, Client, and Server 1.1.1. |
| `1.0.15` | Updated to Core 1.0.10, Client 1.0.11, Graph 1.0.12, React 1.0.12, React UI 1.0.12, and Server 1.0.11. |
| `1.0.14` | Updated to React 1.0.11 and React UI 1.0.11 (graph-explorer primitives). |
| `1.0.13` | Updated to Client, React, React UI, and Server 1.0.10. |
| `1.0.6` | Updated Core, Graph, React, React UI, and Server dependencies through the 1.0.4–1.0.9 train (typed completion model controls, canonical-memory compaction, evals DX). |
| `1.0.4` | Added a searchable, expandable knowledge-graph explorer for registered Neo4j and Memgraph graphs. |
| `1.0.3` | Aligned Studio with the Anvia dark-first design system and added independent Messages/Response, Structure, Raw, JSON, and searchable metadata-table trace payload views. |
| `1.0.2` | Added explicit cancelled-run reporting and graceful draining of active Agent and Pipeline runs before observability providers shut down. |
| `1.0.1` | Refreshed supported upstream SDK and runtime dependencies. |
| `1.0.0` | Adopted linked interaction phases and continuation storage, replaced automatic sandbox discovery with explicit inspectors, and added authorized noVNC browser views with coordinated human-control leases. Added token-count detail to memory-compaction session logs. |
| `1.0.0-rc.9` | Synchronized Studio with the Anvia 1.0 release-candidate train. |
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

- Check Studio's declared Core, Graph, Server, React, and React UI dependency ranges; these packages
  release independently.
- Back up local SQLite files before a version change when their data matters.
- Re-test custom stores against current public store contracts.
- Review route and UI-option behavior when embedding Studio in another server.
- Re-test approval and question interactions, linked phase history, graceful cancellation, model
  policy, graph registrations, sandbox registrations, browser-view authorization, and custom client
  scripts.

Read the complete [Studio changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-studio/CHANGELOG.md).
