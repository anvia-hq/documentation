# Get started

Use SQLite memory when one Node.js process needs durable agent conversations without a database service.

```sh
pnpm add @anvia/core @anvia/memory-sqlite
```

```ts
import { Agent } from '@anvia/core/agent'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const client = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memory = client.memoryStore()
await memory.ensure()

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

`ensure()` creates and validates the tables. Pass `path: ':memory:'` for tests that should disappear with the process. The package is ESM-only and uses Node's built-in `node:sqlite` `DatabaseSync` API.

Keep the same `sessionId`, `userId`, and relevant metadata when continuing a conversation; those values form the default storage scope.

## Next

- [Configuration](/packages/memory-sqlite/configuration)
- [Schema and migrations](/packages/memory-sqlite/schema-and-migrations)
- [Production](/packages/memory-sqlite/production)
