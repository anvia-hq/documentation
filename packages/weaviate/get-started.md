# Get started

```sh
pnpm add @anvia/core @anvia/weaviate weaviate-client
```

```ts
import { WeaviateVectorStore } from '@anvia/weaviate'

const store = await WeaviateVectorStore.connect({
  client,
  className: 'SupportDocs',
  vectorSize: 1536,
  distance: 'cosine',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

Anvia supplies precomputed vectors, so provision the collection without a vectorizer. Without a client, the adapter uses local HTTP and gRPC environment defaults with insecure connections; inject a configured client for remote deployments.

## Next

- [Collections and indexing](/packages/weaviate/collections-and-indexing)
- [Search and filters](/packages/weaviate/search-and-filters)
- [Production](/packages/weaviate/production)
