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
