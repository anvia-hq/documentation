# Production

- Generate and review migrations; do not rely on runtime table creation.
- Inject the same long-lived Drizzle database and pool used by your application.
- Retain transactions and advisory locking for concurrent agent runs.
- Include all Anvia schema files in your Drizzle configuration.
- Monitor and back up message and error tables as potentially sensitive data.
- Test custom schema objects against every package upgrade.

The constructor throws `TypeError` for a wrapper without `transaction`, and for the default `lock: 'advisory'` without raw `execute`. A wrapper lacking `execute` must use `lock: 'none'` and provide its own serialization; make that limitation explicit in deployment tests.

Compaction is exposed by the store but remains opt-in and model-driven at the SDK layer. See [Compaction](/sdk/memory/compaction).
