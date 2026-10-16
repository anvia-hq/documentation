# Releases

Reviewed source release: `1.2.1`. The entries below preserve notable v0 history.

Notable package releases include:

- `1.2.0` added Bun support: `bun:sqlite` loads automatically under Bun with the `foreign_keys` pragma enforced, `node:sqlite` remains the fallback, and caller-owned databases inject through the structural `SqliteMemoryDatabaseLike` surface.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `0.3.0` added durable memory compaction with atomic conflict detection and aggregate usage accounting.
- `0.2.4` added read-only inspection used by SDK and Studio workflows.
- `0.2.2` preserved strict JSON message metadata.
- `0.2.1` preserved tool-result names during rehydration.
- `0.2.0` established the durable database-adapter contract.
- `0.1.0` introduced the SQLite store.

Dependency and patch details remain authoritative in the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md). Review it together with [Schema and migrations](/packages/memory-sqlite/schema-and-migrations) before upgrading a managed schema.

## Changes through 1.2.1

Reviewed `1.2.0` → `1.2.1` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/memory-sqlite/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
