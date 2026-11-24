# Releases

Reviewed source release: `1.3.0`. The entries below preserve notable v0 history.

Notable package releases include:

- `1.3.0` moved the Prisma 8 PostgreSQL target to `@prisma/orm-postgres 8.0.0-rc.20` with the `prisma 8.0.0-rc.27` CLI, and raised the Prisma 7 peer floor to `@prisma/client >=7.10.0 <8.0.0`.
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

## Changes through 1.3.0

Reviewed `1.2.2` → `1.3.0` against SDK source on 2026-11-04. The Prisma 8 target moved to `@prisma/orm-postgres` `8.0.0-rc.20` with the `prisma` `8.0.0-rc.27` CLI. Generated contracts use `@onCreate(cuid(2))` for new IDs, `init --prisma-version 8` starts a contract with the `// use prisma-8` directive the CLI requires and warns instead of editing a contract that lacks it, and runtime clients are built with `contract: contractFromJson<Contract>(contractJson)` from `@prisma/orm-postgres/static`.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/memory-prisma/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.
