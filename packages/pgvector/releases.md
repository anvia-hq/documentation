# Releases

Reviewed source release: `1.2.1`. The entries below preserve notable v0 history.

Reviewed `1.1.5` → `1.2.0` against SDK source on 2026-11-04. Added bound `ne`, `in`, `gte`, and `lte` filters and n-ary `and`/`or`; `ne` is null-safe and range comparisons cast `numeric`. See [search and filters](/packages/pgvector/search-and-filters).

The visible changelog records:

- `1.2.0` added native `ne`, `in`, `gte`, and `lte` filter translation and n-ary `and`/`or`.
- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `1.0.10` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.2.12` simplified optional query and result construction without behavior changes.
- `0.2.11` refreshed runtime dependencies alongside core changes.
- `0.2.10` moved `@anvia/core` to peer dependencies.
- `0.2.6` recorded the flattened workspace layout.
- `0.2.0` aligned imports with the focused core public surface.
- `0.1.6` refreshed pgvector support dependencies.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-pgvector/CHANGELOG.md) for every patch entry.

## Changes in 1.2.1

Reviewed `1.2.0` → `1.2.1` against SDK source on 2026-11-23. Refreshes runtime dependencies.

## Changes through 1.1.4

Reviewed `1.1.3` → `1.1.4` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/2322fcd9b00e4cb82166c7aca319454ee97abe4e/packages/vector-pgvector/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
