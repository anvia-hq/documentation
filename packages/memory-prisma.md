# @anvia/memory-prisma

`@anvia/memory-prisma` stores Anvia agent memory through an application's Prisma client. It is designed for teams that want conversation data and migrations to remain in their existing Prisma workflow.

## Install

```sh
pnpm add @anvia/memory-prisma @anvia/core @prisma/client
```

The package is ESM-only and peers with `@anvia/core >=0.13.0 <1.0.0` and `@prisma/client >=7.9.1 <8.0.0`.

## Generate the model file

Preview the generated Prisma models:

```sh
npx @anvia/memory-prisma init
```

Write them to `prisma/models/anvia-memory.prisma`:

```sh
npx @anvia/memory-prisma init --write
```

For projects that do not use a multi-file Prisma schema, explicitly append the generated block:

```sh
npx @anvia/memory-prisma init --write --append-to-schema
```

Then use the normal Prisma workflow:

```sh
npx prisma validate
npx prisma migrate dev --name add_anvia_memory
npx prisma generate
```

The command is a dry run unless `--write` is present. Review generated changes before migrating.

## Create the store

```ts
import { Agent } from '@anvia/core/agent'
import { createPrismaMemoryStore } from '@anvia/memory-prisma'
import { prisma } from './db.js'

const memory = createPrismaMemoryStore(prisma, {
  scope: {
    metadataKeys: ['tenantId'],
  },
})

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

The conventional client path expects delegates named `agentMemorySession`, `agentMemoryMessage`, and `agentMemoryError`.

## Custom model names

Use `PrismaMemoryStore.fromDelegates(...)` when generated delegate names differ. Supply session and message delegates plus a transaction function; supply the errors delegate unless `errors: 'ignore'` is configured.

Inspection requires the session delegate's optional `findMany` and `findUnique` methods. Compaction additionally requires `messages.deleteMany`. The basic memory methods continue to work when those optional interfaces are unavailable.

## Schema and transaction ownership

The package does not migrate the database at runtime. The generated schema defines:

- `AgentMemorySession`
- `AgentMemoryMessage`
- `AgentMemoryError`

The session scope is unique, message positions are unique per memory session, and child rows cascade when a session is deleted. Pass Prisma transaction options through `transaction`, for example an isolation level supported by your configured connector.

## Production patterns

- Commit the generated schema or append block and manage it with Prisma migrations.
- Re-run Prisma Client generation after schema changes.
- Reuse the application's singleton Prisma client and close it through the application's lifecycle.
- Use stable tenant metadata in the memory scope where necessary.
- Keep message validation enabled at persistence boundaries.
- Treat memory scope as isolation of histories, not user authorization.

Read [Memory save policies](/sdk/memory/save-policies) and [Memory sessions](/sdk/memory/sessions) for agent-side setup.

## Reference

- [API reference](/packages/memory-prisma/api-reference)
- [Memory store adapters](/sdk/memory/store-adapters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/memory-prisma)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-prisma/CHANGELOG.md)
