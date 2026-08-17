# Get started

```sh
pnpm add @anvia/core @anvia/weaviate weaviate-client
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { WeaviateVectorClient } from '@anvia/weaviate';
const storeClient = new WeaviateVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'SupportDocs',
    dimensions: 1536,
    metric: "cosine"
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
```

Anvia supplies precomputed vectors, so provision the collection without a vectorizer. Without a client, the adapter uses local HTTP and gRPC environment defaults with insecure connections; inject a configured client for remote deployments.

## Next

- [Collections and indexing](/packages/weaviate/collections-and-indexing)
- [Search and filters](/packages/weaviate/search-and-filters)
- [Production](/packages/weaviate/production)
