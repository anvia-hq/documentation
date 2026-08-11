# @anvia/redis API reference

All public symbols are exported from `@anvia/redis`.

```ts
import {
  filterToRedisQuery,
  RedisVectorIndex,
  RedisVectorStore,
  type RedisClientLike,
  type RedisDistance,
  type RedisVectorStoreConnectOptions,
} from '@anvia/redis'
```

## filterToRedisQuery

```ts
function filterToRedisQuery(filter: VectorFilter | undefined): string
```

Returns the RediSearch query fragment for an Anvia vector filter.

## RedisVectorStore

```ts
class RedisVectorStore<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> {
  static connect<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: RedisVectorStoreConnectOptions,
  ): Promise<RedisVectorStore<T, Metadata>>

  upsertDocuments(
    documents: Array<EmbeddedDocument<T, Metadata>>,
  ): Promise<void>

  index(model: EmbeddingModel): RedisVectorIndex<T, Metadata>
}
```

## RedisVectorIndex

```ts
class RedisVectorIndex<
  T,
  Metadata extends VectorMetadata = VectorMetadata,
> implements VectorSearchIndex<T, Metadata> {
  constructor(
    model: EmbeddingModel,
    client: RedisClientLike,
    indexName: string,
  )

  search(request: VectorSearchRequest): Promise<Array<VectorSearchResult<T, Metadata>>>
  searchIds(request: VectorSearchRequest): Promise<Array<{ score: number; id: string }>>
  asTool(options: VectorSearchToolOptions): Tool<{ query: string; topK?: number }, unknown>
}
```

## Types

```ts
type RedisDistance = 'COSINE' | 'L2' | 'IP'

type RedisClientLike = {
  ft: {
    create(
      indexName: string,
      schema: Record<string, unknown>,
      options?: Record<string, unknown>,
    ): Promise<unknown>
    search(
      indexName: string,
      query: string,
      options?: Record<string, unknown>,
    ): Promise<unknown>
    dropindex(indexName: string): Promise<unknown>
    info(indexName: string): Promise<unknown>
  }
  hSet(
    key: string,
    fieldValues: Record<string, unknown>,
  ): Promise<unknown>
  expire(key: string, seconds: number): Promise<unknown>
}

type RedisVectorStoreConnectOptions = {
  client?: RedisClientLike
  indexName: string
  keyPrefix?: string
  vectorSize: number
  createIfMissing?: boolean
  distance?: RedisDistance
}
```

Return to the [package guide](/packages/redis).
