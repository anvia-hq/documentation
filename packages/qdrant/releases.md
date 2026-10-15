# Releases

Reviewed source release: `1.1.4`. The entries below preserve notable v0 history.

Notable releases include:

- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `1.0.11` and `1.0.10` refreshed runtime dependencies alongside Core updates.
- `1.0.9` added configurable property-level graph extraction conflict resolution, durable ingestion receipts with optional graph-plus-vector orchestration, explorer source provenance, and shared-resource tenant namespaces for managed Neo4j graphs and Qdrant stores.
- `1.0.8` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.4.0` added logical document deletion, retrieval, and inspection; mutation consistency controls; hosted client options; existing collection validation; stale-point cleanup on document replacement; Manhattan distance; and server-side score thresholds.
- `0.3.1` adopted Qdrant's universal query API for dense search while retaining legacy custom-client compatibility.
- `0.3.0` added sparse embedding contracts and hybrid RRF search; the current adapter also supports DBSF fusion.
- `0.2.11` simplified optional query and result construction.
- `0.2.10` moved `@anvia/core` to a peer dependency.
- `0.2.0` aligned imports with the focused core public surface.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-qdrant/CHANGELOG.md).

## Changes through 1.1.4

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/6664e5df6cfa82c9d8898c2ca2cfba59b2ec0679/packages/vector-qdrant/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
