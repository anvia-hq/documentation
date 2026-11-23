# Releases

Reviewed source release: `1.2.1`. The entries below preserve notable v0 history.

Reviewed `1.1.4` → `1.2.1` against SDK source on 2026-11-04. Version 1.2.0 added native `ne`, `in`, `gte`, and `lte` filters and n-ary `and`/`or`; `in` requires all strings or all integers. Version 1.2.1 updates upstream dependencies. See [search and filters](/packages/qdrant/search-and-filters).

Notable releases include:

- `1.2.0` added native `ne`, `in`, `gte`, and `lte` filter translation and n-ary `and`/`or`.
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

## Changes in 1.2.1

Reviewed `1.2.1` → `1.2.1` against SDK source on 2026-11-23. No source changes beyond dependency alignment in this review window.

## Changes through 1.1.4

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/vector-qdrant/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
