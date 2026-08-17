# Configuration

```ts
const memory = new PrismaMemoryStore({
  client: prisma,
  errorPolicy: 'store',
  validateMessages: true,
  transaction: {
    isolationLevel: 'Serializable',
  },
  scopeKey: {
    metadataKeys: ['tenantId'],
  },
})
```

`transaction` is passed to Prisma's transaction callback options. Choose an isolation level supported by your database and Prisma version.

For renamed or wrapped delegates:

```ts
const memory = new PrismaMemoryStore({
  delegates: {
    sessions,
    messages,
    errors,
    transaction,
  },
  errorPolicy: 'store',
})
```

When `errorPolicy: 'store'`, an error delegate is required. Optional inspection and compaction support depends on the methods described in [Capabilities](/packages/memory-prisma/capabilities).
