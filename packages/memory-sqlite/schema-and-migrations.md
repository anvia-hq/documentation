# Schema and migrations

Calling `store.ensure()` creates:

- `anvia_memory_sessions`
- `anvia_memory_messages`
- `anvia_memory_errors`
- a unique ordered-message index

Messages and errors reference their session with cascading deletes. Appends run in a `BEGIN IMMEDIATE` transaction and positions are unique within a memory session.

Use `createSqliteMemorySchemaSql()` when provisioning the same schema through application migrations, then call `store.validate()` at startup. Upgrades still require diffing the generated DDL, reviewing the [source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-sqlite/CHANGELOG.md), and testing against a copy of production data.

Back up the database with an SQLite-aware workflow. Copying a live file without accounting for journaling can produce an incomplete backup.
