# Schema and migrations

With `createIfMissing: true`, the adapter creates:

- `anvia_memory_sessions`
- `anvia_memory_messages`
- `anvia_memory_errors`
- a unique ordered-message index

Messages and errors reference their session with cascading deletes. Appends run in a `BEGIN IMMEDIATE` transaction and positions are unique within a memory session.

Set `createIfMissing: false` only after provisioning the exact schema expected by the installed package. The package does not export its SQLite DDL or a migration runner, so upgrades require reviewing the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md) and testing against a copy of production data.

Back up the database with an SQLite-aware workflow. Copying a live file without accounting for journaling can produce an incomplete backup.
