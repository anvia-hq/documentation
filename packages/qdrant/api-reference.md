# @anvia/qdrant API reference

All public symbols are exported from `@anvia/qdrant`.

```ts
import {
  QdrantHybridVectorStore,
  QdrantVectorClient,
  QdrantVectorStore,
  filterToQdrantFilter,
  type QdrantClientLike,
  type QdrantDenseVectorStoreOptions,
  type QdrantDistance,
  type QdrantFusion,
  type QdrantHybridVectorStoreOptions,
  type QdrantMutationOptions,
  type QdrantVectorClientOptions,
  type QdrantVectorStoreBaseOptions,
  type QdrantVectorStoreOptions,
} from '@anvia/qdrant'
```

## QdrantVectorClient

```ts
class QdrantVectorClient {
  constructor(options?: QdrantVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: QdrantVectorStoreOptions,
  ): QdrantVectorStore<T, Metadata> | QdrantHybridVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`QdrantVectorClientOptions` accepts an injected `client?: QdrantClientLike`, or the official Qdrant client parameters such as `url` and `apiKey` directly.

Dense store options contain `collectionName`, `dimensions`, optional `metric` and `denseVectorName`, and optional `mode: 'dense'`. Hybrid options require `mode: 'hybrid'` and may add `sparseVectorName`.

## Stores

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const dense = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
const page = await store.inspect({ limit, cursor, filter, providerOptions, abortSignal })
await store.delete({ documentIds, providerOptions })
const items = await store.get({ documentIds })
```

`QdrantHybridVectorStore` also implements:

```ts
const results = await store.searchHybrid({
  vector,
  sparseVector,
  fusion: 'rrf',
  topK,
  minScore,
  filter,
})
```

`QdrantMutationOptions` supports `wait`, `ordering`, and `timeout`. Native distances are `'Cosine' | 'Dot' | 'Euclid'`; `QdrantFusion` follows the core `'rrf' | 'dbsf'` values. `filterToQdrantFilter(filter)` converts an Anvia filter for direct client calls.

Return to the [package guide](/packages/qdrant).
