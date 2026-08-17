# Scoping and concurrency

The default scope key is a JSON array containing `sessionId` and `userId`. Add stable tenant metadata when identifiers are not globally unique.

```ts
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const client = new SqliteMemoryClient({
  path: 'data/memory.sqlite',
})
const memory = client.memoryStore({
  scopeKey: {
    includeUserId: true,
    metadataKeys: ['workspaceId'],
  },
})
```

Scope is a lookup boundary, not authorization. Validate the authenticated user's tenant and session access before invoking the agent.

SQLite appends serialize writers with `BEGIN IMMEDIATE`, and the message-position constraint prevents two rows from claiming the same position. This protects an individual file transaction; it does not make a local SQLite file appropriate for independently scaled containers. Prefer [Postgres memory](/packages/memory-postgres) when several workers must share conversations.
