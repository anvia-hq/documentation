# @anvia/redis API reference

All public symbols are exported from `@anvia/redis`.

```ts
import {
  RedisVectorClient,
  RedisVectorStore,
  filterToRedisQuery,
  type RedisClientLike,
  type RedisDistance,
  type RedisMetadataFieldType,
  type RedisMetadataSchema,
  type RedisVectorClientOptions,
  type RedisVectorStoreOptions,
} from '@anvia/redis'
```

## RedisVectorClient

```ts
class RedisVectorClient {
  constructor(options?: RedisVectorClientOptions)
  vectorStore<T, Metadata extends VectorMetadata = VectorMetadata>(
    options: RedisVectorStoreOptions,
  ): RedisVectorStore<T, Metadata>
  close(): Promise<void>
}
```

`RedisVectorClientOptions` accepts an injected `client?: RedisClientLike` or `url?: string`. `RedisVectorStoreOptions` contains `indexName`, `dimensions`, and optional `keyPrefix`, `metric`, and `metadataSchema`. Metadata schema values are `'numeric' | 'tag'`; native distance values are `'COSINE' | 'L2' | 'IP'`.

## RedisVectorStore

```ts
await store.ensure()
await store.validate()
await store.upsert({ documents, providerOptions })
const results = await store.search({ vector, topK, minScore, filter, providerOptions, abortSignal })
```

`filterToRedisQuery(filter, metadataSchema)` converts a supported Anvia filter into a Redis Search query.

Return to the [package guide](/packages/redis).
