# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

Notable package releases include:

- `0.3.0` added durable memory compaction with atomic conflict detection and aggregate usage accounting.
- `0.2.4` added read-only inspection used by SDK and Studio workflows.
- `0.2.2` preserved strict JSON message metadata.
- `0.2.1` preserved tool-result names during rehydration.
- `0.2.0` established the durable database-adapter contract.
- `0.1.0` introduced the SQLite store.

Dependency and patch details remain authoritative in the [source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-sqlite/CHANGELOG.md). Review it together with [Schema and migrations](/packages/memory-sqlite/schema-and-migrations) before upgrading a managed schema.
