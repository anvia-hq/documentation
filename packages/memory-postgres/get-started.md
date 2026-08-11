# Get started

Use Postgres memory when multiple application processes need the same durable conversation store.

```sh
pnpm add @anvia/core @anvia/memory-postgres pg
```

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

The factory is asynchronous because it can create and verify database objects. By default it provisions the extension, tables, and index. Production deployments usually run the exported schema SQL during migrations, then start with `createIfMissing: false`.

## Next

- [Configuration](/packages/memory-postgres/configuration)
- [Schema and migrations](/packages/memory-postgres/schema-and-migrations)
- [Production](/packages/memory-postgres/production)
