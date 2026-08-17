# Get started

```sh
pnpm add @anvia/core @anvia/lancedb @lancedb/lancedb
```

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { LanceDBVectorClient } from '@anvia/lancedb';
const storeClient = new LanceDBVectorClient({
    uri: 'data/lancedb'
});
const store = storeClient.vectorStore({
    tableName: 'support_docs',
    dimensions: 1536
});
await store.ensure();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 5
});
```

Documents must already contain embeddings. The default URI is `~/.anvia/lancedb`; use an explicit durable URI or injected connection in deployed services.

Despite the method name, this adapter writes with LanceDB `table.add()`. Design refresh and deletion workflows before re-ingesting the same corpus.

## Next

- [Collections and indexing](/packages/lancedb/collections-and-indexing)
- [Search and filters](/packages/lancedb/search-and-filters)
- [Production](/packages/lancedb/production)
