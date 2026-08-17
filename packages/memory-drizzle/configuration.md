# Configuration

Use the canonical exported schema or inject compatible table objects:

```ts
const memory = new DrizzleMemoryStore({
  db,
  schema: drizzleMemorySchema,
  lock: 'advisory',
  errorPolicy: 'store',
  validateMessages: true,
  scopeKey: {
    includeUserId: true,
    metadataKeys: ['tenantId'],
  },
})
```

The schema object must provide `agentMemorySessions`, `agentMemoryMessages`, and `agentMemoryErrors` with the columns expected by the adapter. `lock` defaults to advisory locking where `db.execute` is available; `'none'` opts out.

The database object must provide the Drizzle query and insert/delete methods in the public `DrizzleDatabaseLike` contract. Transaction support is used when available. Connection pooling and shutdown remain owned by the application.
