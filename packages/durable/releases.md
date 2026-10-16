# Releases

The reviewed source release is `@anvia/durable` **0.12.0**. The package is experimental and its database records may
change between releases.

## Changes through 0.12.0

Reviewed `0.3.0` → `0.12.0` against SDK source on 2026-10-15. Added registration compaction (0.4), verified multi-session goals (0.5), per-submission goal agents (0.6), shared histories and bounded inspection (0.7), queued steering and SQLite schema 9 (0.8), goal controls (0.9), continuing rounds (0.10), stable run traces (0.11), and application-selected observability sessions (0.12). See [Goals](/packages/durable/goals), [Compaction](/packages/durable/compaction), [Steering](/packages/durable/steering), [Tracing](/packages/durable/tracing), and [Operations](/packages/durable/operations). Upgrade Core and Durable together for execution protocol 4; snapshots can contain linked history references, and database downgrades are unsupported.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/durable/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `0.3.0` | Accepted core structured user messages as durable prompts, enabling image and document inputs in runs, graph tasks, and owned agents. Multimodal content is validated and preserved across history and recovery, and request identities compare by canonical JSON. String prompts still work. Journals with structured prompts cannot be read by older releases. The client and server peer ranges allow the 0.3 line. |
| `0.2.1` | Added validated runtime agent registration (`registerAgents`) and safe removal of idle registrations (`unregisterAgent`). Hosts can admit new immutable configurations without closing unrelated executions and unload archived ones while keeping journal history. Existing agent IDs cannot be overwritten, and unfinished runs or settling attempts prevent removal. |
| `0.2.0` | Added opt-in durable agent streaming with persisted generation deltas, unique model-attempt identities, and validated streamed response checkpoints. Completed model and tool results are preserved across retries and restarts, and clients reconnect through the existing event cursor APIs. SQLite upgrades to schema 4 and requires core execution protocol version 2. Observer failures are excluded from automatic model retries, streamed responses commit before local completion callbacks, and primary stream errors are preserved when iterator cleanup also fails. |
| `0.1.1` | First release. Experimental SQLite-backed durable agent execution with deduplicated submissions, model and tool checkpoints, restart recovery, persisted approvals, and reconnectable progress events. Interrupted tools need reconciliation unless declared `safe` or `idempotent`. Added paginated run discovery, opt-in session queues, bounded concurrency, and persisted model retry with backoff; authorized Fetch-compatible HTTP routes and a browser-safe client with cursor-based SSE reconnection; persisted static task graphs with dependency gating, snapshots, and cancellation (SQLite schema 2); schema-validated versioned custom tasks with persisted checkpoints, dynamic child ownership, all-settled and fail-fast joins, owned agent runs, durable signals and timers, and conservative effect journaling and reconciliation (schema 3); and fail-closed storage handling, readiness, aggregate metrics, admission, payload, and operation limits, and offline SQLite backup and restore. Requires Node.js 22.16 or newer. Custom stores must implement capacity-count and metrics methods. |

## Related package releases

- `@anvia/core` 1.7.0 added the agent execution boundaries and stable tool operation IDs used by durable
  execution. The current runtime requires execution protocol 4 (introduced in Core 1.13);
  use mutually compatible current Core and Durable releases. Direct agent
  execution behavior is unchanged.
- `@anvia/server` 1.2.0 and `@anvia/client` 1.3.0 added the opt-in `./durable` subpaths (run, graph, and
  custom-task routes and methods, with owned-agent authorization mapped to the parent task session and root
  task identity in task event envelopes). Server 1.2.1 and client 1.3.1 added the 0.2 peer range, and server
  1.2.2 and client 1.3.2 added 0.3, all through an optional `@anvia/durable` peer. The reviewed Server 1.3.4 and Client 1.4.4
  ranges extend through Durable 0.12; use these for the full steering and tracing contracts.
- `@anvia/cli` 1.5.0 bundles the `anvia-durable` skill (see [CLI](/packages/cli)).

Read the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/durable/CHANGELOG.md).
