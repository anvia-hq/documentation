# Configuration

```ts
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const client = new SqliteMemoryClient({
  path: 'data/memory.sqlite',
})
const memory = client.memoryStore({
  validateMessages: true,
  errorPolicy: 'store',
  scopeKey: {
    includeUserId: true,
    metadataKeys: ['tenant.id'],
  },
})
```

`path` is required unless an existing database is injected. Message validation and error storage default to enabled. Nested metadata paths are supported when building a scope key.

An injected database remains caller-owned and must enable foreign-key enforcement; `ensure()` and `validate()` reject connections with `PRAGMA foreign_keys` off:

```ts
database.exec('PRAGMA foreign_keys = ON')
```

For complete control, pass a function:

```ts
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const client = new SqliteMemoryClient({
  path: 'data/memory.sqlite',
})
const memory = client.memoryStore({
  scopeKey: ({ scope }) =>
    JSON.stringify([scope.metadata?.tenantId ?? null, scope.sessionId]),
})
```

Scope functions must be deterministic. Changing one after data exists creates different lookup keys; it does not migrate old conversations.
