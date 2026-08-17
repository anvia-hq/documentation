# @anvia/pinecone API reference

All public symbols are exported from `@anvia/pinecone`.

```ts
import {
  PineconeVectorClient,
  PineconeVectorStore,
  filterToPineconeFilter,
  type PineconeClientLike,
  type PineconeIndexLike,
  type PineconeMetric,
  type PineconeNamespaceLike,
  type PineconeVectorClientOptions,
  type PineconeVectorStoreOptions,
} from '@anvia/pinecone'
```

## PineconeVectorClient

```ts
class PineconeVectorClient {
  constructor(options?: PineconeVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: PineconeVectorStoreOptions,
  ): PineconeVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`PineconeVectorClientOptions` accepts an injected `client?: PineconeClientLike` or `apiKey?: string`. `PineconeVectorStoreOptions` contains `indexName`, `dimensions`, and optional `namespace`, `metric`, and `spec`. Native `PineconeMetric` values are `'cosine' | 'euclidean' | 'dotproduct'`.

## PineconeVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`filterToPineconeFilter(filter)` converts an Anvia `VectorFilter` for direct Pinecone queries.

Return to the [package guide](/packages/pinecone).
