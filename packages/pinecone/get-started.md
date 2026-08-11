# Get started

Provision a Pinecone index with the embedding model's dimension before connecting.

```sh
pnpm add @anvia/core @anvia/pinecone @pinecone-database/pinecone
```

```ts
import { PineconeVectorStore } from '@anvia/pinecone'

const store = await PineconeVectorStore.connect({
  client,
  indexName: 'support-docs',
  namespace: 'production',
  metric: 'cosine',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

Documents must already contain embeddings. The adapter uses the standard Pinecone client when `client` is omitted. Keep credentials and endpoint configuration in that SDK or inject a centrally managed client.

## Next

- [Collections and indexing](/packages/pinecone/collections-and-indexing)
- [Search and filters](/packages/pinecone/search-and-filters)
- [Production](/packages/pinecone/production)
