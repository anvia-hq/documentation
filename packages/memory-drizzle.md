# @anvia/memory-drizzle

`@anvia/memory-drizzle` adds durable Anvia memory to applications that use Drizzle with PostgreSQL. The package exports its table definitions so the application can include memory in the same schema and migration workflow as the rest of its data.

## Install

```sh
pnpm add @anvia/memory-drizzle @anvia/core drizzle-orm
```

The package is ESM-only and peers with `@anvia/core >=0.13.0 <1.0.0` and `drizzle-orm >=0.45.2 <1.0.0`. Supply a PostgreSQL Drizzle database instance; the exported tables use `drizzle-orm/pg-core`.

## Add the schema

```ts
import { drizzleMemorySchema } from '@anvia/memory-drizzle'

export const schema = {
  ...applicationSchema,
  ...drizzleMemorySchema,
}
```

Generate and apply the resulting migration with your normal Drizzle tooling. The adapter does not run DDL or migrations.

## Create the store

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createDrizzleMemoryStore } from '@anvia/memory-drizzle'

const memory = createDrizzleMemoryStore(db, {
  scope: {
    metadataKeys: ['tenantId'],
  },
})

const agent = new AgentBuilder('support', model)
  .memory(memory, { savePolicy: 'turn' })
  .build()
```

The default schema uses `agent_memory_sessions`, `agent_memory_messages`, and `agent_memory_errors`, with unique indexes for scope keys and ordered message positions.

## Use a custom schema mapping

Pass a `schema` object with the same three roles when your application aliases the exported tables:

```ts
const memory = createDrizzleMemoryStore(db, {
  schema: {
    agentMemorySessions,
    agentMemoryMessages,
    agentMemoryErrors,
  },
})
```

The runtime expects compatible Drizzle table shapes. Changing column semantics is not an adapter customization point.

## Runtime behavior

- Appends use a Drizzle transaction when the database exposes `transaction`.
- The default `lock: 'advisory'` acquires a PostgreSQL advisory lock when `execute` is available.
- Messages and failed runs are validated and stored by default.
- The store exposes read-only inspection and compaction interfaces.
- Default scope contains `sessionId` and `userId`; metadata paths or a custom function can extend it.

For concurrency-sensitive production use, provide a Drizzle database with transaction and execute support. `lock: 'none'` removes the advisory lock and should be paired with an application-level serialization strategy.

## Production patterns

- Keep the memory tables in the application's checked-in Drizzle schema.
- Review generated migrations rather than creating tables at request time.
- Apply migrations before deploying code that expects a changed adapter schema.
- Add tenant metadata to the scope when session IDs are not globally unique.
- Treat scope as a storage key, not authorization.

Read [Configure memory](/sdk/memory/configure) and [Memory compaction](/sdk/memory/compaction) for the SDK-side behavior.

## Reference

- [API reference](/packages/memory-drizzle/api-reference)
- [Memory store adapters](/sdk/memory/store-adapters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/memory-drizzle)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-drizzle/CHANGELOG.md)
