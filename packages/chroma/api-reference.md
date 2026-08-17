# @anvia/chroma API reference

All public symbols are exported from `@anvia/chroma`.

```ts
import {
  ChromaVectorClient,
  ChromaVectorStore,
  filterToChromaWhere,
  type ChromaClientLike,
  type ChromaCollectionLike,
  type ChromaVectorClientOptions,
  type ChromaVectorStoreOptions,
} from '@anvia/chroma'
```

## ChromaVectorClient

```ts
class ChromaVectorClient {
  constructor(options?: ChromaVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: ChromaVectorStoreOptions,
  ): ChromaVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`ChromaVectorClientOptions` accepts either an injected `client?: ChromaClientLike` or `path?: string` for the default client.

## ChromaVectorStore

`ChromaVectorStoreOptions` contains `collectionName`, `dimensions`, optional `metric`, and optional Chroma `metadata` and `configuration` objects.

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`ensure()` creates a missing collection and validates its configuration. `validate()` never creates infrastructure. `filterToChromaWhere(filter)` converts an Anvia `VectorFilter` for direct Chroma calls.

Return to the [package guide](/packages/chroma).
