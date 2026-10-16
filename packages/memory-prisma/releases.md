# Releases

Reviewed source release: `1.2.2`. The entries below preserve notable v0 history.

Notable package releases include:

- `1.2.1` fixed schema CLI invocation through package-manager symlinks and paths containing spaces or URL-special characters.
- `1.2.0` added the `/v8` entrypoint for Prisma 8 PostgreSQL memory, preserved Prisma 7 at the root entrypoint, made each Prisma runtime peer independently optional, and added explicit Prisma 8 initialization support.
- `1.1.3` declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents.
- `1.1.2` refreshed runtime dependencies alongside the Core 1.1.2 update.
- `1.1.1` bumped upstream runtime dependencies to their latest versions, aligned zod to `4.5.4`, and updated the Core dependency to `1.1.1`.
- `0.3.1` refreshed upstream runtime dependencies.
- `0.3.0` added compaction with atomic conflict detection and usage aggregation.
- `0.2.4` added optional read-only inspection.
- `0.2.2` preserved strict JSON metadata.
- `0.2.1` preserved tool-result names.
- `0.2.0` introduced the durable Prisma adapter family release.

Release entries are generated through Changesets. Consult the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-prisma/CHANGELOG.md) before migrating schema or changing peer versions.

## Changes through 1.2.2

Reviewed `1.2.1` → `1.2.2` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/memory-prisma/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
