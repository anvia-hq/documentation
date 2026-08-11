# @anvia/qdrant API reference

All public symbols are exported from `@anvia/qdrant`.

```ts
import {
  filterToQdrantFilter,
  QdrantVectorIndex,
  QdrantVectorStore,
  type QdrantClientLike,
  type QdrantDistance,
  type QdrantFusion,
  type QdrantHybridIndexOptions,
  type QdrantIndexOptions,
  type QdrantVectorStoreConnectOptions,
} from '@anvia/qdrant'
```

## filterToQdrantFilter

```ts
function filterToQdrantFilter(
  filter: VectorFilter | undefined,
): unknown
```

Converts an Anvia vector filter into a Qdrant filter value.

## QdrantVectorStore

```ts
class QdrantVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: QdrantVectorStoreConnectOptions,
  ): Promise<QdrantVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(options: QdrantIndexOptions): QdrantVectorIndex<T, Metadata>
}
```

## QdrantVectorIndex

```ts
class QdrantVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    client: QdrantClientLike,
    collectionName: string,
    hybrid?: {
      sparse: SparseEmbeddingModel
      fusion: QdrantFusion
      denseVectorName: string
      sparseVectorName: string
      prefetchLimit?: number
    },
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

The constructor's hybrid object is part of the emitted class signature but is not a separately exported named type. Most applications should use `store.index(...)`.

## Types

```ts
type QdrantDistance = 'Cosine' | 'Dot' | 'Euclid'
type QdrantFusion = 'rrf' | 'dbsf'

type QdrantClientLike = {
  getCollection(collectionName: string): Promise<unknown>
  createCollection(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
  upsert(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
  search?(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
  query?(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
}

type QdrantVectorStoreConnectOptions = {
  client?: QdrantClientLike
  collectionName: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: QdrantDistance
  hybrid?: boolean
  denseVectorName?: string
  sparseVectorName?: string
}

type QdrantHybridIndexOptions = {
  dense: EmbeddingModel
  sparse: SparseEmbeddingModel
  fusion?: QdrantFusion
  denseVectorName?: string
  sparseVectorName?: string
  prefetchLimit?: number
}

type QdrantIndexOptions = EmbeddingModel | QdrantHybridIndexOptions
```

Return to the [package guide](/packages/qdrant).
