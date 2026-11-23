# Releases

Reviewed source release: `1.2.2`. The entries below preserve notable v0 history.

Reviewed `1.1.5` → `1.2.1` against SDK source on 2026-11-04. Version 1.2.0 added native `ne`, `in`, `gte`, and `lte` filters and n-ary `and`/`or`; 1.2.1 updates upstream dependencies. See [search and filters](/packages/weaviate/search-and-filters).

Notable releases include:

- `1.2.0` added native `ne`, `in`, `gte`, and `lte` filter translation and n-ary `and`/`or`.
- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `1.0.10` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.2.5` refreshed runtime dependencies across provider, vector, observability, UI, and Studio packages.
- `0.2.4` simplified optional query and result construction without behavior changes.
- `0.2.3` aligned with refreshed core and schema-first pipeline work.
- `0.2.2` moved `@anvia/core` to peer dependencies.
- `0.2.0` introduced the Weaviate v3 collections adapter and near-vector queries.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-weaviate/CHANGELOG.md).

## Changes in 1.2.2

Reviewed `1.2.1` → `1.2.2` against SDK source on 2026-11-23. Refreshes runtime dependencies.

## Changes through 1.1.4

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/vector-weaviate/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
