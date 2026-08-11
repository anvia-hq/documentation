# Production

SQLite is a strong fit for a durable single-process service, desktop tool, or edge deployment with a persistent local volume.

- Use an explicit path on durable storage; `:memory:` is never restart-durable.
- Keep database files outside image layers and ephemeral build directories.
- Run SQLite-aware backups and verify restores.
- Keep `validateMessages: true` when persisted data may be untrusted.
- Review disk growth from messages, errors, and compacted history.
- Test your Node version for `node:sqlite` support.

The adapter opens a synchronous `DatabaseSync` connection and does not expose a close method. Treat the store as process-scoped. For multiple replicas, remote failover, or independently managed database connections, use a shared adapter such as [Postgres](/packages/memory-postgres).

Compaction is opt-in at the agent layer; read [Compaction](/sdk/memory/compaction) before enabling model-generated summaries.
