# @anvia/weaviate API reference

All public symbols are exported from `@anvia/weaviate`.

```ts
import {
  filterToWeaviateWhere,
  WeaviateVectorIndex,
  WeaviateVectorStore,
  type WeaviateBatcherLike,
  type WeaviateBatchLike,
  type WeaviateClientLike,
  type WeaviateCollectionLike,
  type WeaviateCollectionsLike,
  type WeaviateDistance,
  type WeaviateVectorStoreConnectOptions,
} from '@anvia/weaviate'
```

## filterToWeaviateWhere

```ts
function filterToWeaviateWhere(
  filter: VectorFilter | undefined,
): unknown
```

Converts an Anvia vector filter into a Weaviate filter value.

## WeaviateVectorStore

```ts
class WeaviateVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: WeaviateVectorStoreConnectOptions,
  ): Promise<WeaviateVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): WeaviateVectorIndex<T, Metadata>
}
```

## WeaviateVectorIndex

```ts
class WeaviateVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    client: WeaviateClientLike,
    className: string,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type WeaviateDistance =
  | 'cosine'
  | 'dot'
  | 'l2'
  | 'manhattan'
  | 'hamming'

type WeaviateCollectionLike = {
  query: {
    nearVector(params: {
      vector: number[]
      limit?: number
      filters?: unknown
      returnMetadata?: string[]
      returnProperties?: string[]
    }): Promise<Array<Record<string, unknown>>>
  }
}

type WeaviateCollectionsLike = {
  create(config: Record<string, unknown>): Promise<unknown>
  get(name: string): WeaviateCollectionLike
  delete(name: string): Promise<unknown>
  exists(name: string): Promise<boolean>
}

type WeaviateBatcherLike = {
  withObject(obj: Record<string, unknown>): WeaviateBatcherLike
  do(): Promise<unknown>
}

type WeaviateBatchLike = {
  objectsBatcher(): WeaviateBatcherLike
}

type WeaviateClientLike = {
  collections: WeaviateCollectionsLike
  batch: WeaviateBatchLike
}

type WeaviateVectorStoreConnectOptions = {
  client?: WeaviateClientLike
  className: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: WeaviateDistance
}
```

The inline `nearVector` parameter object is emitted internally as `NearVectorParams`; that name is not exported from the package barrel.

Return to the [package guide](/packages/weaviate).
