# Capabilities

`@anvia/memory-drizzle` persists ordered memory through application-owned Drizzle tables.

- Loads, appends, clears, and records failed runs.
- Validates persisted messages by default.
- Exposes canonical PostgreSQL table objects and a replaceable schema object.
- Supports read-only inspection.
- Supports atomic memory compaction with aggregate usage accounting.
- Uses transactions and, where the database exposes `execute`, advisory locks for scoped writes.

The adapter targets PostgreSQL Drizzle schemas; it is not a database-neutral Drizzle adapter. It does not run Drizzle Kit, manage a connection, authenticate tenants, or schedule compaction.

See [API reference](/packages/memory-drizzle/api-reference) for the exported schema and store types.
