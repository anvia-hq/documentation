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
