# Configuration

Pass a connection string or an existing `pg`-compatible client or pool:

```ts
const memory = await createPostgresMemoryStore({
  client: pool,
  createIfMissing: false,
  tablePrefix: 'assistant_',
  lock: 'advisory',
  scope: {
    metadataKeys: ['tenantId'],
  },
})
```

`tablePrefix` defaults to `anvia_`. Explicit `tableNames` override the session, message, and error table names individually. Identifiers are validated and quoted by the adapter.

`lock: 'advisory'` is the safe default for concurrent appends to one scope. Use `'none'` only when another layer serializes writes. Error storage and message validation are enabled by default.

When a client is injected, its pool sizing, TLS, timeouts, retries, and shutdown remain application responsibilities.
