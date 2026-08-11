# Get started

```sh
pnpm add @anvia/core @anvia/milvus @zilliz/milvus2-sdk-node
```

```ts
import { MilvusVectorStore } from '@anvia/milvus'

const store = await MilvusVectorStore.connect({
  client,
  collectionName: 'support_docs',
  vectorSize: 1536,
  metric: 'COSINE',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

Documents must already contain dense embeddings. Without a client, the adapter connects to `localhost:19530`; inject a configured client for any remote deployment.

`connect()` loads the collection. When automatic creation is enabled, it also creates the Anvia fields and a baseline HNSW index.

## Next

- [Collections and indexing](/packages/milvus/collections-and-indexing)
- [Search and filters](/packages/milvus/search-and-filters)
- [Production](/packages/milvus/production)
