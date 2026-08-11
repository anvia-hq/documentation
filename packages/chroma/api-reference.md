# @anvia/chroma API reference

All public symbols are exported from `@anvia/chroma`.

```ts
import {
  ChromaVectorIndex,
  ChromaVectorStore,
  filterToChromaWhere,
  type ChromaClientLike,
  type ChromaCollectionLike,
  type ChromaVectorStoreConnectOptions,
} from '@anvia/chroma'
```

## filterToChromaWhere

```ts
function filterToChromaWhere(
  filter: VectorFilter | undefined,
): unknown
```

Converts an Anvia vector filter into the value passed to Chroma's `where` query option.

## ChromaVectorStore

```ts
class ChromaVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: ChromaVectorStoreConnectOptions,
  ): Promise<ChromaVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): ChromaVectorIndex<T, Metadata>
}
```

## ChromaVectorIndex

```ts
class ChromaVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(model: EmbeddingModel, collection: ChromaCollectionLike)

  search(
    request: VectorSearchRequest,
  ): Promise<Array<VectorSearchResult<T, Metadata>>>

  searchIds(
    request: VectorSearchRequest,
  ): Promise<Array<{ score: number; id: string }>>

  asTool(
    options: VectorSearchToolOptions,
  ): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type ChromaClientLike = {
  getCollection(
    options: Record<string, unknown>,
  ): Promise<ChromaCollectionLike>
  createCollection(
    options: Record<string, unknown>,
  ): Promise<ChromaCollectionLike>
  getOrCreateCollection?(
    options: Record<string, unknown>,
  ): Promise<ChromaCollectionLike>
}

type ChromaCollectionLike = {
  upsert(options: Record<string, unknown>): Promise<unknown>
  query(options: Record<string, unknown>): Promise<unknown>
}

type ChromaVectorStoreConnectOptions = {
  client?: ChromaClientLike
  collectionName: string
  createIfMissing?: boolean
  metadata?: Record<string, unknown>
  configuration?: Record<string, unknown>
}
```

Return to the [package guide](/packages/chroma).
