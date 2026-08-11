# @anvia/redis

`@anvia/redis` stores embedded documents as Redis hashes and searches them through a RediSearch HNSW vector index.

## Install

```sh
pnpm add @anvia/redis @anvia/core @anvia/openai redis
```

The ESM package includes the Redis client and peers with `@anvia/core >=0.7.1 <1.0.0`. The target Redis deployment must support the `FT.*` search commands used by the adapter.

## Store and search documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { RedisVectorStore } from '@anvia/redis'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
const embeddings = openai.embeddingModel('text-embedding-3-small')
const sourceDocuments = [
  {
    id: 'password-reset',
    text: 'Password reset links expire after 30 minutes.',
  },
]

const documents = await embedDocuments(embeddings, sourceDocuments, {
  id: (document) => document.id,
  content: (document) => document.text,
})

const store = await RedisVectorStore.connect({
  indexName: 'support_docs',
  keyPrefix: 'knowledge:support:',
  vectorSize: 1536,
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

Without an injected client, the adapter connects to `REDIS_URL` or `redis://localhost:6379`.

## Index ownership

By default, `connect()` checks the index and creates a hash-backed HNSW index when missing. The default key prefix is `anvia:<indexName>:` and the default distance is `COSINE`. The vector field uses `FLOAT32` with the configured dimension.

For production, create and tune the search index through deployment automation, then pass `createIfMissing: false`. Keep `indexName`, prefix, dimension, distance, and field layout consistent with the adapter.

The adapter writes hashes without expiration. Retention, deletion, and stale-document cleanup belong to the application. Metadata names beginning with `__anvia_` are reserved.

## Production patterns

- Inject an already-connected client when the application owns reconnect and shutdown behavior.
- Use a dedicated, collision-free key prefix.
- Plan memory capacity for serialized documents and vectors.
- Provision RediSearch and validate index readiness before application startup.
- Add an explicit corpus replacement or garbage-collection process.

## Reference

- [API reference](/packages/redis/api-reference)
- [Vector stores](/sdk/knowledges/vector-stores)
- [Metadata filters](/sdk/knowledges/metadata-filters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-redis)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-redis/CHANGELOG.md)
