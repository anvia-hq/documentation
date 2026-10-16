# Releases

Reviewed source release: `1.1.5`. The entries below preserve notable v0 history.

Notable package releases include:

- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `0.3.0` added durable compaction with atomic conflict detection and usage aggregation.
- `0.2.3` added read-only memory inspection.
- `0.2.1` preserved strict JSON metadata.
- `0.2.0` established the durable database-adapter contract.
- `0.1.0` introduced the Postgres store.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-postgres/CHANGELOG.md). Before upgrading, compare its changes with your generated DDL and concurrency tests.

## Changes through 1.1.4

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/memory-postgres/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
