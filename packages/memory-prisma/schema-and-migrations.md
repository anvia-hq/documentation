# Schema and migrations

The CLI defaults to a dry run. With `--write`, it creates `prisma/models/anvia-memory.prisma` beside the resolved schema:

```sh
npx @anvia/memory-prisma init --schema prisma/schema.prisma
npx @anvia/memory-prisma init --schema prisma/schema.prisma --write
```

Use `--append-to-schema` when your Prisma setup does not load split schema files. The command warns before modifying the main schema, rejects conflicting model names, and only replaces its own generated marker block with `--force`.

After review, run `prisma validate`, create a migration, and regenerate the client. The runtime does not apply DDL.

The generated models are `AgentMemorySession`, `AgentMemoryMessage`, and `AgentMemoryError`.
`AgentMemorySession.compactionState` is nullable JSON containing the latest summary checkpoint and
canonical message boundary; compaction does not remove covered messages. Existing installations
must generate and deploy the additive field migration, then regenerate Prisma Client.

If you change model delegate names or shapes, pass explicit `delegates` to `PrismaMemoryStore` and
retain all required fields and unique constraints. Follow the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-prisma/CHANGELOG.md) for schema-affecting changes.

## Prisma 8 contracts

Select Prisma 8 explicitly and provide one PSL contract path:

```sh
pnpm exec anvia-memory-prisma init \
  --prisma-version 8 \
  --contract src/prisma/contract.prisma \
  --write
```

Use `--append-to-contract` for an existing contract and `--force` only to replace a previously
generated Anvia block. Prisma 8 uses `--contract` and `--append-to-contract`; Prisma 7 uses
`--schema` and `--append-to-schema`. The CLI rejects mixed version flags, conflicting models, and
malformed generated markers.

For a new database, emit the reviewed contract and use the locally installed Prisma 8 CLI to
preview and apply its database update. Existing Prisma 7 installations can reuse the same tables,
but Prisma 7 should retain migration ownership during the transition.
