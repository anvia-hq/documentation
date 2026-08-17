# Configuration

Pass a connection string or an existing `pg`-compatible client or pool:

```ts
import { PostgresMemoryClient } from '@anvia/memory-postgres'

const client = new PostgresMemoryClient({
  client: pool,
})
const memory = client.memoryStore({
  tablePrefix: 'assistant_',
  lock: 'advisory',
  scopeKey: {
    metadataKeys: ['tenantId'],
  },
})
await memory.validate()
```

`tablePrefix` defaults to `anvia_`. Explicit `tableNames` override the session, message, and error table names individually. Identifiers are validated and quoted by the adapter.

`lock: 'advisory'` is the safe default for concurrent appends to one scope. Use `'none'` only when another layer serializes writes. Error storage and message validation are enabled by default.

When a client is injected, its pool sizing, TLS, timeouts, retries, and shutdown remain application responsibilities.
