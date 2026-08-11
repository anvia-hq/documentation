# Configuration

```ts
const memory = createSqliteMemoryStore({
  path: 'data/memory.sqlite',
  createIfMissing: true,
  validateMessages: true,
  errors: 'store',
  scope: {
    includeUserId: true,
    metadataKeys: ['tenant.id'],
  },
})
```

`path` defaults to `:memory:`. `createIfMissing`, `validateMessages`, and error storage default to enabled. Nested metadata paths are supported when building a scope key.

For complete control, pass a function:

```ts
const memory = createSqliteMemoryStore({
  path: 'data/memory.sqlite',
  scope: ({ sessionId, metadata }) =>
    JSON.stringify([metadata?.tenantId ?? null, sessionId]),
})
```

Scope functions must be deterministic. Changing one after data exists creates different lookup keys; it does not migrate old conversations.
