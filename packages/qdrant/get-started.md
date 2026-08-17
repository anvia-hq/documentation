# Get started

```sh
pnpm add @anvia/core @anvia/qdrant @qdrant/js-client-rest
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { QdrantVectorClient } from '@anvia/qdrant';
const storeClient = new QdrantVectorClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs',
    dimensions: 1536,
    metric: "cosine"
});
await store.ensure();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
const stored = await store.get({ documentIds: ['support-1'] });
const page = await store.inspect({ limit: 50 });
```

Pass either an existing `client` or official Qdrant client parameters such as `url` and `apiKey`.
Use `ensure()` when this process may create a missing collection and `validate()` when infrastructure
owns provisioning.

For hybrid search, create the store with `mode: 'hybrid'`; ingested documents must contain aligned dense and sparse embeddings.

## Next

- [Collections and indexing](/packages/qdrant/collections-and-indexing)
- [Search and filters](/packages/qdrant/search-and-filters)
- [Production](/packages/qdrant/production)
