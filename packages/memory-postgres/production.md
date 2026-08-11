# Production

- Provision schema through migrations and use `createIfMissing: false`.
- Inject a pool configured for TLS, connection limits, statement timeouts, and graceful shutdown.
- Keep the advisory lock unless writes are serialized elsewhere.
- Back up and monitor all three tables; errors can contain sensitive prompts or tool output.
- Keep `validateMessages: true` at persistence boundaries.
- Test compaction and concurrent appends under your transaction proxy or pooling mode.

The factory-created pool is not exposed through the store, so applications that need explicit lifecycle control should create and inject their own pool. The adapter does not retry failed transactions; place bounded retry policy around the run only when operations are safe to repeat.

For agent-level behavior, see [Configure memory](/sdk/memory/configure) and [Compaction](/sdk/memory/compaction).
