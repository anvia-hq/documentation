# @anvia/pinecone API reference

All public symbols are exported from `@anvia/pinecone`.

```ts
import {
  filterToPineconeFilter,
  PineconeVectorIndex,
  PineconeVectorStore,
  type PineconeClientLike,
  type PineconeIndexLike,
  type PineconeMetric,
  type PineconeNamespaceLike,
  type PineconeVectorStoreConnectOptions,
} from '@anvia/pinecone'
```

## filterToPineconeFilter

```ts
function filterToPineconeFilter(
  filter: VectorFilter | undefined,
): unknown
```

Converts an Anvia vector filter into Pinecone filter syntax.

## PineconeVectorStore

```ts
class PineconeVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: PineconeVectorStoreConnectOptions,
  ): Promise<PineconeVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): PineconeVectorIndex<T, Metadata>
}
```

## PineconeVectorIndex

```ts
class PineconeVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    namespace: PineconeNamespaceLike,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type PineconeMetric = 'cosine' | 'euclidean' | 'dotproduct'

type PineconeClientLike = {
  listIndexes(): Promise<unknown>
  createIndex(options: Record<string, unknown>): Promise<unknown>
  index(indexName: string): PineconeIndexLike
}

type PineconeIndexLike = {
  namespace(namespace: string): PineconeNamespaceLike
}

type PineconeNamespaceLike = {
  upsert(vectors: Array<Record<string, unknown>>): Promise<unknown>
  query(options: Record<string, unknown>): Promise<unknown>
}

type PineconeVectorStoreConnectOptions = {
  client?: PineconeClientLike
  indexName: string
  namespace?: string
  createIfMissing?: boolean
  metric?: PineconeMetric
}
```

Return to the [package guide](/packages/pinecone).
