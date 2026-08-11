# Get started

```sh
pnpm add @anvia/core @anvia/qdrant @qdrant/js-client-rest
```

```ts
import { QdrantVectorStore } from '@anvia/qdrant'

const store = await QdrantVectorStore.connect({
  client,
  collectionName: 'support_docs',
  vectorSize: 1536,
  distance: 'Cosine',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

For hybrid search, the collection must be created with `hybrid: true`, and ingested documents must contain aligned dense and sparse embeddings.

## Next

- [Collections and indexing](/packages/qdrant/collections-and-indexing)
- [Search and filters](/packages/qdrant/search-and-filters)
- [Production](/packages/qdrant/production)
