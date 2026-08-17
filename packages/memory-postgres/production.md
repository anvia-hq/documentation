# Production

- Provision schema through migrations and call `store.validate()` during startup.
- Inject a pool configured for TLS, connection limits, statement timeouts, and graceful shutdown.
- Keep the advisory lock unless writes are serialized elsewhere.
- Back up and monitor all three tables; errors can contain sensitive prompts or tool output.
- Keep `validateMessages: true` at persistence boundaries.
- Test compaction and concurrent appends under your transaction proxy or pooling mode.

`PostgresMemoryClient` exposes the native client and owns a pool created from a connection string. Call `close()` during shutdown. An injected client remains application-owned. The adapter does not retry failed transactions; place bounded retry policy around the run only when operations are safe to repeat.

For agent-level behavior, see [Configure memory](/sdk/memory/configure) and [Compaction](/sdk/memory/compaction).
