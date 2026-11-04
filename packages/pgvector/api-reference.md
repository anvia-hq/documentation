# @anvia/pgvector API reference

All public symbols are exported from `@anvia/pgvector`.

```ts
import {
  PgVectorClient,
  PgVectorStore,
  filterToPgVectorWhere,
  type PgClientLike,
  type PgVectorClientOptions,
  type PgVectorDistance,
  type PgVectorStoreOptions,
  type PgVectorWhere,
} from '@anvia/pgvector'
```

## PgVectorClient

```ts
class PgVectorClient {
  constructor(options?: PgVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: PgVectorStoreOptions,
  ): PgVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`PgVectorClientOptions` accepts an injected `client?: PgClientLike` or `connectionString?: string`. `PgVectorStoreOptions` contains `tableName`, `dimensions`, and optional `metric`. Native `PgVectorDistance` values are `'cosine' | 'l2' | 'innerProduct'`.

## PgVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`filterToPgVectorWhere(filter)` returns a `{ sql, values }` `PgVectorWhere` value for direct queries. It binds keys and values as parameters, uses null-safe SQL for `ne` (`IS DISTINCT FROM` for non-null values and a negated JSON-null check for `null`), emits `= ANY(...)` for `in`, and supports n-ary `and`/`or` with sequential placeholders. Range operators require numeric filter values; empty `in` lists and non-numeric ranges throw.

Return to the [package guide](/packages/pgvector).
