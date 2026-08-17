# @anvia/lancedb API reference

All public symbols are exported from `@anvia/lancedb`.

```ts
import {
  LanceDBVectorClient,
  LanceDBVectorStore,
  filterToLanceExpr,
  type LanceDBConnectionLike,
  type LanceDBTableLike,
  type LanceDBVectorClientOptions,
  type LanceDBVectorStoreOptions,
} from '@anvia/lancedb'
```

## LanceDBVectorClient

```ts
class LanceDBVectorClient {
  constructor(options?: LanceDBVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: LanceDBVectorStoreOptions,
  ): LanceDBVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`LanceDBVectorClientOptions` accepts an injected `client?: LanceDBConnectionLike` or `uri?: string`. `LanceDBVectorStoreOptions` contains `tableName`, `dimensions`, and optional `metric`.

## LanceDBVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`ensure()` creates a missing table and validates it; `validate()` only checks an existing table. `filterToLanceExpr(filter)` returns the expression used for a direct LanceDB query.

Return to the [package guide](/packages/lancedb).
