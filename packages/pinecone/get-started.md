# Get started

Provision a Pinecone index with the embedding model's dimension before connecting.

```sh
pnpm add @anvia/core @anvia/pinecone @pinecone-database/pinecone
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { PineconeVectorClient } from '@anvia/pinecone';
const storeClient = new PineconeVectorClient({
    client
});
const store = storeClient.vectorStore({
    indexName: 'support-docs',
    namespace: 'production',
    metric: 'cosine',
    dimensions: embeddings.dimensions!
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
```

Documents must already contain embeddings. The adapter uses the standard Pinecone client when `client` is omitted. Keep credentials and endpoint configuration in that SDK or inject a centrally managed client.

## Next

- [Collections and indexing](/packages/pinecone/collections-and-indexing)
- [Search and filters](/packages/pinecone/search-and-filters)
- [Production](/packages/pinecone/production)
