# Releases

Reviewed source release: `1.2.1`. The entries below preserve notable v0 history.

Notable releases include:

- `1.2.0` upgraded to Pinecone SDK 9, requiring Node.js 22 and targeting Pinecone API 2026-07. Index creation supports serverless and BYOC specifications; legacy pod creation, metadata-indexing schemas, and source collection/backup creation options are no longer available.
- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` refreshed runtime dependencies alongside the Core 1.1.1 update.
- `1.0.10` through `1.0.4` refreshed runtime dependencies alongside the Core 1.0.x updates.
- `0.3.9` and `0.3.8` refreshed upstream runtime dependencies.
- `0.3.7` simplified optional query and result construction without changing behavior.
- `0.3.6` aligned with refreshed core and schema-first pipeline changes.
- `0.3.5` moved `@anvia/core` to a peer dependency.
- `0.3.0` introduced the Pinecone adapter with filters, multi-embedding support, and `asTool()`.

See the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-pinecone/CHANGELOG.md).

## Changes through 1.2.1

Reviewed `1.2.0` → `1.2.1` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/vector-pinecone/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
