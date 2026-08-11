# Configuration

```ts
const memory = createPrismaMemoryStore(prisma, {
  errors: 'store',
  validateMessages: true,
  transaction: {
    isolationLevel: 'Serializable',
  },
  scope: {
    metadataKeys: ['tenantId'],
  },
})
```

`transaction` is passed to Prisma's transaction callback options. Choose an isolation level supported by your database and Prisma version.

For renamed or wrapped delegates:

```ts
const memory = PrismaMemoryStore.fromDelegates(
  {
    sessions,
    messages,
    errors,
    transaction,
  },
  { errors: 'store' },
)
```

When `errors: 'store'`, an error delegate is required. Optional inspection and compaction support depends on the methods described in [Capabilities](/packages/memory-prisma/capabilities).
