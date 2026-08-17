# @anvia/milvus API reference

All public symbols are exported from `@anvia/milvus`.

```ts
import {
  MilvusVectorClient,
  MilvusVectorStore,
  filterToMilvusExpr,
  type MilvusClientLike,
  type MilvusMetric,
  type MilvusVectorClientOptions,
  type MilvusVectorStoreOptions,
} from '@anvia/milvus'
```

## MilvusVectorClient

```ts
class MilvusVectorClient {
  constructor(options?: MilvusVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: MilvusVectorStoreOptions,
  ): MilvusVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`MilvusVectorClientOptions` accepts an injected `client?: MilvusClientLike`, or `address?: string` and optional `token`. `MilvusVectorStoreOptions` contains `collectionName`, `dimensions`, and optional `metric`. The native `MilvusMetric` values are `'COSINE' | 'L2' | 'IP'`.

## MilvusVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`filterToMilvusExpr(filter)` converts an Anvia `VectorFilter` to a Milvus expression.

Return to the [package guide](/packages/milvus).
