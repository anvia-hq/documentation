# Get started

Use a Redis deployment with RediSearch vector commands enabled.

```sh
pnpm add @anvia/core @anvia/redis redis
```

```ts
import { RedisVectorStore } from '@anvia/redis'

const store = await RedisVectorStore.connect({
  client,
  indexName: 'support_docs',
  keyPrefix: 'knowledge:support:',
  vectorSize: 1536,
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

Documents must already contain embeddings. Without an injected client, the adapter uses `REDIS_URL` or `redis://localhost:6379` and connects automatically.

## Next

- [Collections and indexing](/packages/redis/collections-and-indexing)
- [Search and filters](/packages/redis/search-and-filters)
- [Production](/packages/redis/production)
