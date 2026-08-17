# Get started

```sh
pnpm add @anvia/core @anvia/chroma chromadb
```

Embed documents before writing them; the adapter deliberately disables Chroma's collection embedding function.

```ts
import { embedDocuments } from '@anvia/core/embeddings';
import { retrieveDocuments } from '@anvia/core/vector-store';
import { ChromaVectorClient } from '@anvia/chroma';
const { documents } = await embedDocuments({
    model: embeddings,
    documents: sourceDocuments,
    id: (document) => document.id,
    content: (document) => document.text
});
const storeClient = new ChromaVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs',
    dimensions: embeddings.dimensions!
});
await store.validate();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({
    store,
    model: embeddings,
    query: 'How do I reset my password?',
    topK: 5
});
```

`client` may be omitted and `path` may configure the default Chroma client. Use `ensure()` when this process may create a missing collection; use `validate()` when infrastructure owns provisioning.

## Next

- [Collections and indexing](/packages/chroma/collections-and-indexing)
- [Search and filters](/packages/chroma/search-and-filters)
- [Production](/packages/chroma/production)
