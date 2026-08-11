# Get started

```sh
pnpm add @anvia/core @anvia/pgvector pg pgvector
```

```ts
import { PgVectorStore } from '@anvia/pgvector'

const store = await PgVectorStore.connect({
  client: pool,
  tableName: 'support_docs',
  vectorSize: 1536,
  distance: 'cosine',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

The table and `vector` extension must exist when creation is disabled. `connect()` validates that the embedding column exists and has the configured dimension.

Without `client`, pass `connectionString`; the adapter otherwise creates a `pg` pool using standard environment behavior.

## Next

- [Collections and indexing](/packages/pgvector/collections-and-indexing)
- [Search and filters](/packages/pgvector/search-and-filters)
- [Production](/packages/pgvector/production)
