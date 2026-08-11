# @anvia/milvus API reference

All public symbols are exported from `@anvia/milvus`.

```ts
import {
  filterToMilvusExpr,
  MilvusVectorIndex,
  MilvusVectorStore,
  type MilvusClientLike,
  type MilvusMetric,
  type MilvusVectorStoreConnectOptions,
} from '@anvia/milvus'
```

## filterToMilvusExpr

```ts
function filterToMilvusExpr(
  filter: VectorFilter | undefined,
): string | undefined
```

Returns a Milvus filter expression, or `undefined` when no filter is supplied.

## MilvusVectorStore

```ts
class MilvusVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: MilvusVectorStoreConnectOptions,
  ): Promise<MilvusVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): MilvusVectorIndex<T, Metadata>
}
```

## MilvusVectorIndex

```ts
class MilvusVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    client: MilvusClientLike,
    collectionName: string,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type MilvusMetric = 'COSINE' | 'L2' | 'IP'

type MilvusClientLike = {
  hasCollection(options: {
    collection_name: string
  }): Promise<{ value: boolean }>
  createCollection(options: Record<string, unknown>): Promise<unknown>
  createIndex(options: Record<string, unknown>): Promise<unknown>
  loadCollection(options: {
    collection_name: string
  }): Promise<unknown>
  insert(options: Record<string, unknown>): Promise<unknown>
  search(options: Record<string, unknown>): Promise<unknown>
}

type MilvusVectorStoreConnectOptions = {
  client?: MilvusClientLike
  collectionName: string
  vectorSize: number
  createIfMissing?: boolean
  metric?: MilvusMetric
}
```

Return to the [package guide](/packages/milvus).
