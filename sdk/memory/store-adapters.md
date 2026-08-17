# Store adapters

Anvia provides Prisma, Drizzle, direct Postgres, and SQLite memory stores. Choose the adapter that matches the database and migration workflow the application already operates.

Keep every package on the v1 release-candidate channel while the core API is in RC.

## Prisma

Use Prisma when the application already owns a Prisma schema and client:

```bash
pnpm add @anvia/core@rc @anvia/memory-prisma@rc @prisma/client
npx @anvia/memory-prisma init
npx @anvia/memory-prisma init --write
npx prisma validate
npx prisma migrate dev --name add_anvia_memory
```

The init command is a dry run unless `--write` is supplied. By default it creates `prisma/models/anvia-memory.prisma`; use the explicit `--append-to-schema` flag only after reviewing the generated models.

```ts
import { PrismaMemoryStore } from '@anvia/memory-prisma'

const memoryStore = new PrismaMemoryStore({
  client: prisma,
  scopeKey: { metadataKeys: ['tenantId'] },
})
```

The conventional client path expects the generated `agentMemorySession`, `agentMemoryMessage`, and `agentMemoryError` delegates. Pass a custom `delegates` object to the constructor when model names differ.

See [Prisma memory](/packages/memory-prisma/get-started).

## Drizzle with Postgres

Use Drizzle when memory tables should live in the application's Drizzle schema and migration flow:

```bash
pnpm add @anvia/core@rc @anvia/memory-drizzle@rc drizzle-orm
npx @anvia/memory-drizzle init
npx @anvia/memory-drizzle init --write
npx drizzle-kit generate
npx drizzle-kit migrate
```

```ts
import {
  DrizzleMemoryStore,
  drizzleMemorySchema,
} from '@anvia/memory-drizzle'

export const schema = {
  ...drizzleMemorySchema,
}

const memoryStore = new DrizzleMemoryStore({
  db,
  scopeKey: { metadataKeys: ['tenantId'] },
})
```

Ensure the generated schema exports are included by the `schema` path in the Drizzle configuration.

See [Drizzle memory](/packages/memory-drizzle/get-started).

## Direct Postgres

Use the Postgres adapter when the application owns a connection string or `pg`-compatible client without an ORM:

```bash
pnpm add @anvia/core@rc @anvia/memory-postgres@rc
```

```ts
import { PostgresMemoryClient } from '@anvia/memory-postgres'

const memoryClient = new PostgresMemoryClient({
  connectionString: process.env.DATABASE_URL!,
})
const memoryStore = memoryClient.memoryStore({
  scopeKey: { metadataKeys: ['tenantId'] },
})
await memoryStore.ensure()
```

Call `ensure()` when the adapter owns schema creation. When application migrations own it, apply `createPostgresMemorySchemaSql()` and call `validate()` at startup.

See [Postgres memory](/packages/memory-postgres/get-started).

## SQLite

Use SQLite for local tools, desktop applications, tests, or small single-node deployments:

```bash
pnpm add @anvia/core@rc @anvia/memory-sqlite@rc
```

```ts
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const memoryClient = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memoryStore = memoryClient.memoryStore({
  scopeKey: { metadataKeys: ['tenantId'] },
})
await memoryStore.ensure()
```

The adapter uses the runtime's built-in `node:sqlite` support. Pass `path: ':memory:'` for an in-memory database. Use `ensure()` for adapter-owned schema setup or `validate()` after application-managed migrations.

See [SQLite memory](/packages/memory-sqlite/get-started).

## Shared adapter behavior

Official adapters:

- key storage by `sessionId` and `userId` by default, with optional metadata paths;
- preserve ordered, complete provider-neutral messages;
- validate stored message shapes by default;
- record failed runs unless `errorPolicy: 'ignore'` is selected;
- expose atomic compaction through `store.compaction`; and
- expose read-only conversation inspection for Studio and internal tooling.

Postgres and Drizzle use advisory locking by default for ordered concurrent writes. Scope and locking prevent storage collisions, but authorization remains the application's responsibility.

Continue with [Custom stores](/sdk/memory/custom-stores).
