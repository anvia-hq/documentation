# Releases

Reviewed source release: `1.1.5`. The entries below preserve notable v0 history.

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

## Changes through 1.1.5

Reviewed `1.1.3` → `1.1.5` against SDK source on 2026-10-15. Refreshed package guidance and updated the LanceDB client dependency. Check the source changelog alongside database and native-runtime compatibility.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/6664e5df6cfa82c9d8898c2ca2cfba59b2ec0679/packages/vector-lancedb/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
