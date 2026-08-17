# Get started

```sh
pnpm add @anvia/core @anvia/milvus @zilliz/milvus2-sdk-node
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { MilvusVectorClient } from '@anvia/milvus';
const storeClient = new MilvusVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs',
    dimensions: 1536,
    metric: 'cosine'
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
```

Documents must already contain dense embeddings. Without a client, the adapter connects to `localhost:19530`; inject a configured client for any remote deployment.

`ensure()` creates and loads a missing collection, while `validate()` requires the existing collection to match the configured dimensions and metric.

## Next

- [Collections and indexing](/packages/milvus/collections-and-indexing)
- [Search and filters](/packages/milvus/search-and-filters)
- [Production](/packages/milvus/production)
