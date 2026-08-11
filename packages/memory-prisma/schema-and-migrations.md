# Schema and migrations

The CLI defaults to a dry run. With `--write`, it creates `prisma/models/anvia-memory.prisma` beside the resolved schema:

```sh
npx @anvia/memory-prisma init --schema prisma/schema.prisma
npx @anvia/memory-prisma init --schema prisma/schema.prisma --write
```

Use `--append-to-schema` when your Prisma setup does not load split schema files. The command warns before modifying the main schema, rejects conflicting model names, and only replaces its own generated marker block with `--force`.

After review, run `prisma validate`, create a migration, and regenerate the client. The runtime does not apply DDL.

The generated models are `AgentMemorySession`, `AgentMemoryMessage`, and `AgentMemoryError`. If you change their client delegate names or shape, use `fromDelegates` and retain all required fields and unique constraints. Follow the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-prisma/CHANGELOG.md) for schema-affecting changes.
