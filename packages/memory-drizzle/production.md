# Production

- Generate and review migrations; do not rely on runtime table creation.
- Inject the same long-lived Drizzle database and pool used by your application.
- Retain transactions and advisory locking for concurrent agent runs.
- Include all Anvia schema files in your Drizzle configuration.
- Monitor and back up message and error tables as potentially sensitive data.
- Test custom schema objects against every package upgrade.

If a custom Drizzle wrapper lacks transactions or raw `execute`, the adapter cannot provide the same concurrency guarantees as a full PostgreSQL Drizzle client. Make that limitation explicit in deployment tests.

Compaction is exposed by the store but remains opt-in and model-driven at the SDK layer. See [Compaction](/sdk/memory/compaction).
