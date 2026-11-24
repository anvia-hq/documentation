# Releases

Reviewed source release: `1.1.7`. The entries below preserve notable v0 history.

Reviewed against SDK source on 2026-11-04. LanceDB continues to apply the Core filter matcher after retrieval; the richer operators need no adapter release because they run in the shared matcher. See [search and filters](/packages/lancedb/search-and-filters).

Notable releases in the source changelog include:

- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to the Core 1.1.1 dependency.
- `1.0.10` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.2.6` refreshed upstream runtime dependencies.
- `0.2.5` simplified optional query and result construction without changing behavior.
- `0.2.3` refreshed dependencies alongside schema-first pipeline changes in core.
- `0.2.2` moved `@anvia/core` to peer dependencies.
- `0.2.0` introduced the embedded LanceDB adapter with columnar storage and SQL-like filters.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-lancedb/CHANGELOG.md).

## Changes in 1.1.7

Reviewed `1.1.6` → `1.1.7` against SDK source on 2026-11-23. Refreshes runtime dependencies; filters still run through the shared Core matcher.

## Changes through 1.1.5

Reviewed `1.1.3` → `1.1.5` against SDK source on 2026-10-15. Refreshed package guidance and updated the LanceDB client dependency. Check the source changelog alongside database and native-runtime compatibility.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/7aa42c0a16c14cd96e42e503a2dd4c68a2ba9488/packages/vector-lancedb/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
