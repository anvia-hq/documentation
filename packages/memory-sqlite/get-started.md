# Get started

Use SQLite memory when one Node.js process needs durable agent conversations without a database service.

```sh
pnpm add @anvia/core @anvia/memory-sqlite
```

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { createSqliteMemoryStore } from '@anvia/memory-sqlite'

const memory = createSqliteMemoryStore({
  path: 'data/anvia-memory.sqlite',
})

const agent = new AgentBuilder('support', model)
  .memory(memory, { savePolicy: 'turn' })
  .build()
```

The store creates its tables on first use. Omitting `path` selects `:memory:`, which is useful for tests but disappears with the process. The package is ESM-only and uses Node's built-in `node:sqlite` `DatabaseSync` API.

Keep the same `sessionId`, `userId`, and relevant metadata when continuing a conversation; those values form the default storage scope.

## Next

- [Configuration](/packages/memory-sqlite/configuration)
- [Schema and migrations](/packages/memory-sqlite/schema-and-migrations)
- [Production](/packages/memory-sqlite/production)
