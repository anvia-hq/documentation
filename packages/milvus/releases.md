# Releases

Current stable release: `1.1.3`. The entries below preserve notable v0 history.

Notable releases include:

- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` bumped upstream runtime dependencies, aligned zod to 4.5.4 across workspaces, and updated to the Core 1.1.1 dependency.
- `1.0.11` refreshed runtime dependencies alongside the Core 1.0.10 update.
- `1.0.10` included the metadata-filter security fix (filter-key validation in Boolean expressions): filter keys must be plain identifiers, must not use reserved expression keywords as path segments, and numeric values must be finite, so hostile filter input fails fast with a descriptive error.
- `1.0.9` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.3.8` refreshed upstream runtime dependencies.
- `0.3.7` simplified optional query and result construction without behavior changes.
- `0.3.6` aligned with refreshed core and schema-first pipeline work.
- `0.3.5` moved `@anvia/core` to a peer dependency.
- `0.3.0` introduced the Milvus adapter with filter translation, multi-embedding support, and `asTool()`.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-milvus/CHANGELOG.md).
