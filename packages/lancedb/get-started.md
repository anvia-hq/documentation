# Get started

```sh
pnpm add @anvia/core @anvia/lancedb @lancedb/lancedb
```

```ts
import { LanceDBVectorStore } from '@anvia/lancedb'

const store = await LanceDBVectorStore.connect({
  uri: 'data/lancedb',
  tableName: 'support_docs',
  vectorSize: 1536,
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'reset a password',
  topK: 5,
})
```

Documents must already contain embeddings. The default URI is `~/.anvia/lancedb`; use an explicit durable URI or injected connection in deployed services.

Despite the method name, this adapter writes with LanceDB `table.add()`. Design refresh and deletion workflows before re-ingesting the same corpus.

## Next

- [Collections and indexing](/packages/lancedb/collections-and-indexing)
- [Search and filters](/packages/lancedb/search-and-filters)
- [Production](/packages/lancedb/production)
