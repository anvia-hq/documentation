# Releases

Current release candidate: `1.0.0-rc.2`. The entries below preserve notable v0 history.

Notable package releases include:

- `0.3.0` added durable compaction with atomic conflict detection and usage aggregation.
- `0.2.3` added read-only memory inspection.
- `0.2.1` preserved strict JSON metadata.
- `0.2.0` established the durable database-adapter contract.
- `0.1.0` introduced the Postgres store.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-postgres/CHANGELOG.md). Before upgrading, compare its changes with your generated DDL and concurrency tests.
