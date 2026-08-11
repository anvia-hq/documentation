# @anvia/memory-postgres

`@anvia/memory-postgres` stores Anvia agent memory in PostgreSQL. Use it when several application instances need the same durable conversation history or when memory belongs in an existing operational Postgres environment.

## Install

```sh
pnpm add @anvia/memory-postgres @anvia/core
```

The package includes `pg` and peers with `@anvia/core >=0.13.0 <1.0.0`.

## Connect a store

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createPostgresMemoryStore } from '@anvia/memory-postgres'

const memory = await createPostgresMemoryStore({
  connectionString: process.env.DATABASE_URL,
})

const agent = new AgentBuilder('support', model)
  .memory(memory, { savePolicy: 'turn' })
  .build()
```

You may pass a compatible client or pool instead of `connectionString`. Pool-like clients let the adapter acquire and release a connection for each transaction.

## What it provides

- Ordered, transactional message persistence.
- Advisory transaction locking per memory scope by default.
- Failed-run storage and message validation by default.
- Read-only inspection and memory compaction support.
- Custom table prefixes or explicit table names.
- Exportable schema SQL for application-owned migrations.

## Own the schema in production

The development-friendly default is `createIfMissing: true`. It creates the `pgcrypto` extension, sessions, messages, errors, and the unique message-position index.

For controlled deployments, generate the same SQL and apply it through your migration system:

```ts
import { createPostgresMemorySchemaSql } from '@anvia/memory-postgres'

const sql = createPostgresMemorySchemaSql({
  tablePrefix: 'app_',
})
```

Then connect without DDL at application startup:

```ts
const memory = await createPostgresMemoryStore({
  connectionString: process.env.DATABASE_URL,
  tablePrefix: 'app_',
  createIfMissing: false,
})
```

Keep the schema options identical in the migration and runtime configuration. Explicit `tableNames` override the prefix for individual tables.

## Scope and concurrency

The default scope combines `sessionId` and `userId`. Add tenant metadata when needed:

```ts
const memory = await createPostgresMemoryStore({
  connectionString: process.env.DATABASE_URL,
  scope: {
    metadataKeys: ['tenantId'],
  },
  lock: 'advisory',
})
```

Advisory locking serializes position assignment for concurrent appends to the same scope. Set `lock: 'none'` only when another layer guarantees that those writes cannot race. Scope isolation does not replace database authorization or tenant access checks.

## Production patterns

- Reuse an application-managed pool when connection ownership and shutdown are already centralized.
- Apply DDL through migrations and use `createIfMissing: false` in runtime processes.
- Monitor table growth and decide how long conversation and error histories should remain.
- Keep `validateMessages: true` unless validated messages are guaranteed upstream.
- Review custom names as identifiers, not arbitrary SQL fragments; the adapter validates and quotes them.

See [Memory sessions](/sdk/memory/sessions) for context design and [Custom stores](/sdk/memory/custom-stores) for the core contract.

## Reference

- [API reference](/packages/memory-postgres/api-reference)
- [Memory store adapters](/sdk/memory/store-adapters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/memory-postgres)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-postgres/CHANGELOG.md)
