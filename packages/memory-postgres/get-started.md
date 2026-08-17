# Get started

Use Postgres memory when multiple application processes need the same durable conversation store.

```sh
pnpm add @anvia/core @anvia/memory-postgres pg
```

```ts
import { Agent } from '@anvia/core/agent'
import { PostgresMemoryClient } from '@anvia/memory-postgres'

const client = new PostgresMemoryClient({
  connectionString: process.env.DATABASE_URL!,
})
const memory = client.memoryStore()
await memory.ensure()

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

The client is lazy. `ensure()` provisions and verifies the extension, tables, and index. Production deployments usually run the exported schema SQL during migrations, then call `validate()` at startup.

## Next

- [Configuration](/packages/memory-postgres/configuration)
- [Schema and migrations](/packages/memory-postgres/schema-and-migrations)
- [Production](/packages/memory-postgres/production)
