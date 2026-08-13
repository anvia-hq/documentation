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
  type QdrantMutationOptions,
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
    mutationOptions?: QdrantMutationOptions,
  ): Promise<void>

  deleteDocuments(
    documentIds: string[],
    mutationOptions?: QdrantMutationOptions,
  ): Promise<void>

  getDocuments(
    documentIds: string[],
  ): Promise<Array<VectorInspectItem<T, Metadata>>>

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
  inspect(request: VectorInspectRequest): Promise<VectorInspectPage<T, Metadata>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

The constructor's hybrid object is part of the emitted class signature but is not a separately exported named type. Most applications should use `store.index(...)`.

## Types

```ts
type QdrantDistance = 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan'
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
  batchUpdate?(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
  collectionExists?(collectionName: string): Promise<unknown>
  delete?(
    collectionName: string,
    options: Record<string, unknown>,
  ): Promise<unknown>
  scroll?(
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

type QdrantVectorStoreBaseConnectOptions = {
  collectionName: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: QdrantDistance
  hybrid?: boolean
  denseVectorName?: string
  sparseVectorName?: string
}

type QdrantVectorStoreConnectOptions = QdrantVectorStoreBaseConnectOptions &
  (
    | { client: QdrantClientLike; clientOptions?: never }
    | { client?: undefined; clientOptions?: QdrantClientParams }
  )

type QdrantMutationOptions = {
  wait?: boolean
  ordering?: 'weak' | 'medium' | 'strong'
  timeout?: number
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

`upsertDocuments(...)` replaces every point for each logical document ID, so reducing the number of
embeddings does not leave stale points. Mutations wait for Qdrant by default. The official client
uses an ordered batch for replacement; a custom client without `batchUpdate(...)` falls back to a
non-atomic delete followed by upsert.

`deleteDocuments(...)` removes every point belonging to the supplied logical IDs.
`getDocuments(...)` and `index.inspect(...)` require a client with `scroll(...)` support and return
logical documents rather than individual embedding points.

Return to the [package guide](/packages/qdrant).
