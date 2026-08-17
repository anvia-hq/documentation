# Get started

Use a Redis deployment with RediSearch vector commands enabled.

```sh
pnpm add @anvia/core @anvia/redis redis
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { RedisVectorClient } from '@anvia/redis';
const storeClient = new RedisVectorClient({
    client
});
const store = storeClient.vectorStore({
    indexName: 'support_docs',
    keyPrefix: 'knowledge:support:',
    dimensions: 1536
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
```

Documents must already contain embeddings. Without an injected client, the adapter uses `REDIS_URL` or `redis://localhost:6379` and connects automatically.

## Next

- [Collections and indexing](/packages/redis/collections-and-indexing)
- [Search and filters](/packages/redis/search-and-filters)
- [Production](/packages/redis/production)
