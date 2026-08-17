# @anvia/weaviate API reference

All public symbols are exported from `@anvia/weaviate`.

```ts
import {
  WeaviateVectorClient,
  WeaviateVectorStore,
  filterToWeaviateWhere,
  type WeaviateClientLike,
  type WeaviateCollectionLike,
  type WeaviateCollectionsLike,
  type WeaviateDistance,
  type WeaviateVectorClientOptions,
  type WeaviateVectorStoreOptions,
} from '@anvia/weaviate'
```

## WeaviateVectorClient

```ts
class WeaviateVectorClient {
  constructor(options?: WeaviateVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: WeaviateVectorStoreOptions,
  ): WeaviateVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`WeaviateVectorClientOptions` accepts an injected `client?: WeaviateClientLike` or connection fields `httpHost`, `httpPort`, `grpcHost`, `grpcPort`, `httpSecure`, and `grpcSecure`. `WeaviateVectorStoreOptions` contains `collectionName`, `dimensions`, and optional `metric`. Native distance values are `'cosine' | 'dot' | 'l2-squared'`.

## WeaviateVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`filterToWeaviateWhere(filter)` converts an Anvia `VectorFilter` for direct Weaviate calls.

Return to the [package guide](/packages/weaviate).
