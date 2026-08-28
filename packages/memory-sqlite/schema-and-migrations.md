# Schema and migrations

Calling `store.ensure()` creates:

- `anvia_memory_sessions`
- `anvia_memory_messages`
- `anvia_memory_errors`
- a unique ordered-message index

Messages and errors reference their session with cascading deletes. Appends run in a `BEGIN IMMEDIATE` transaction and positions are unique within a memory session.

The session table includes nullable `compaction_state_json`. It stores the latest summary checkpoint
and canonical message boundary; compaction does not remove covered messages. `store.ensure()` adds
the column when upgrading an adapter-managed database. For application-managed schemas, add the
nullable text column in a reviewed migration before calling `store.validate()`.

Use `createSqliteMemorySchemaSql()` when provisioning the same schema through application migrations, then call `store.validate()` at startup. Upgrades still require diffing the generated DDL, reviewing the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md), and testing against a copy of production data.

Back up the database with an SQLite-aware workflow. Copying a live file without accounting for journaling can produce an incomplete backup.
