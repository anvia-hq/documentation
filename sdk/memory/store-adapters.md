# Store adapters

Choose the adapter that matches the database layer your application already operates.

| Package | Use when |
| --- | --- |
| [`@anvia/memory-prisma`](/packages/memory-prisma/get-started) | The application already uses Prisma and owns Prisma migrations. |
| [`@anvia/memory-drizzle`](/packages/memory-drizzle/get-started) | The application uses Drizzle with Postgres. |
| [`@anvia/memory-postgres`](/packages/memory-postgres/get-started) | The application owns a Postgres pool without an ORM. |
| [`@anvia/memory-sqlite`](/packages/memory-sqlite/get-started) | Local or small deployments need durable SQLite storage. |

All official adapters implement `MemoryStore`, maintain ordered message rows, support scoped conversations, and expose compaction and read-only inspection capabilities.

## Prisma

Generate the models, review them, and apply them through the application's normal migration workflow.

```sh
pnpm add @anvia/memory-prisma @anvia/core @prisma/client
npx @anvia/memory-prisma init
npx @anvia/memory-prisma init --write
npx prisma validate
npx prisma migrate dev --name add_anvia_memory
```

```ts
const memory = createPrismaMemoryStore(prisma, {
  scope: { metadataKeys: ['tenantId'] },
})
```

## Drizzle

Add `drizzleMemorySchema` to the Drizzle schema and generate a migration normally.

```ts
const memory = createDrizzleMemoryStore(db)
```

## Postgres

```ts
const memory = await createPostgresMemoryStore({
  connectionString: process.env.DATABASE_URL,
})
```

The adapter creates its tables by default. Set `createIfMissing: false` when migrations own schema creation.

## SQLite

```ts
const memory = createSqliteMemoryStore({
  path: 'data/anvia-memory.sqlite',
  scope: { metadataKeys: ['tenantId'] },
})
```

SQLite uses Node's built-in `node:sqlite` driver and creates its tables by default.
