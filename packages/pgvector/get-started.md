# Get started

```sh
pnpm add @anvia/core @anvia/pgvector pg pgvector
```

```ts
import { retrieveDocuments } from '@anvia/core/vector-store';
import { PgVectorClient } from '@anvia/pgvector';
const storeClient = new PgVectorClient({
    client: pool
});
const store = storeClient.vectorStore({
    tableName: 'support_docs',
    dimensions: 1536,
    metric: "cosine"
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({ store, model: embeddings, query, topK: 5 });
```

The table and `vector` extension must exist before `validate()`. Use `ensure()` when this process may create missing infrastructure; both methods check the configured dimensions.

Without `client`, pass `connectionString`; the adapter otherwise creates a `pg` pool using standard environment behavior.

## Next

- [Collections and indexing](/packages/pgvector/collections-and-indexing)
- [Search and filters](/packages/pgvector/search-and-filters)
- [Production](/packages/pgvector/production)
