# Releases

The current release is `@anvia/durable` **0.3.0**. The package is experimental and its database records may
change between releases.

| Version | Summary |
| --- | --- |
| `0.3.0` | Accepted core structured user messages as durable prompts, enabling image and document inputs in runs, graph tasks, and owned agents. Multimodal content is validated and preserved across history and recovery, and request identities compare by canonical JSON. String prompts still work. Journals with structured prompts cannot be read by older releases. The client and server peer ranges allow the 0.3 line. |
| `0.2.1` | Added validated runtime agent registration (`registerAgents`) and safe removal of idle registrations (`unregisterAgent`). Hosts can admit new immutable configurations without closing unrelated executions and unload archived ones while keeping journal history. Existing agent IDs cannot be overwritten, and unfinished runs or settling attempts prevent removal. |
| `0.2.0` | Added opt-in durable agent streaming with persisted generation deltas, unique model-attempt identities, and validated streamed response checkpoints. Completed model and tool results are preserved across retries and restarts, and clients reconnect through the existing event cursor APIs. SQLite upgrades to schema 4 and requires core execution protocol version 2. Observer failures are excluded from automatic model retries, streamed responses commit before local completion callbacks, and primary stream errors are preserved when iterator cleanup also fails. |
| `0.1.1` | First release. Experimental SQLite-backed durable agent execution with deduplicated submissions, model and tool checkpoints, restart recovery, persisted approvals, and reconnectable progress events. Interrupted tools need reconciliation unless declared `safe` or `idempotent`. Added paginated run discovery, opt-in session queues, bounded concurrency, and persisted model retry with backoff; authorized Fetch-compatible HTTP routes and a browser-safe client with cursor-based SSE reconnection; persisted static task graphs with dependency gating, snapshots, and cancellation (SQLite schema 2); schema-validated versioned custom tasks with persisted checkpoints, dynamic child ownership, all-settled and fail-fast joins, owned agent runs, durable signals and timers, and conservative effect journaling and reconciliation (schema 3); and fail-closed storage handling, readiness, aggregate metrics, admission, payload, and operation limits, and offline SQLite backup and restore. Requires Node.js 22.16 or newer. Custom stores must implement capacity-count and metrics methods. |

## Related package releases

- `@anvia/core` 1.7.0 added the agent execution boundaries and stable tool operation IDs used by durable
  execution, and 1.8.0 added persisted streaming support and execution protocol version 2. Direct agent
  execution behavior is unchanged.
- `@anvia/server` 1.2.0 and `@anvia/client` 1.3.0 added the opt-in `./durable` subpaths (run, graph, and
  custom-task routes and methods, with owned-agent authorization mapped to the parent task session and root
  task identity in task event envelopes). Server 1.2.1 and client 1.3.1 added the 0.2 peer range, and server
  1.2.2 and client 1.3.2 added 0.3, all through an optional `@anvia/durable` peer.
- `@anvia/cli` 1.5.0 bundles the `anvia-durable` skill (see [CLI](/packages/cli)).

Read the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/durable/CHANGELOG.md).
