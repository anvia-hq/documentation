# Get started

```sh
pnpm add @anvia/core @anvia/qdrant @qdrant/js-client-rest
```

```ts
import { QdrantVectorStore } from '@anvia/qdrant'

const store = await QdrantVectorStore.connect({
  collectionName: 'support_docs',
  vectorSize: 1536,
  distance: 'Cosine',
  clientOptions: {
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
  },
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)

const stored = await store.getDocuments(['support-1'])
const page = await index.inspect({ limit: 50 })
```

Pass either an existing `client` or `clientOptions`, never both. Automatic creation is convenient
for development. Use `createIfMissing: false` when infrastructure owns collection provisioning;
the adapter then validates that the existing collection matches the requested configuration.

For hybrid search, the collection must be created with `hybrid: true`, and ingested documents must contain aligned dense and sparse embeddings.

## Next

- [Collections and indexing](/packages/qdrant/collections-and-indexing)
- [Search and filters](/packages/qdrant/search-and-filters)
- [Production](/packages/qdrant/production)
