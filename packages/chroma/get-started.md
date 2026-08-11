# Get started

```sh
pnpm add @anvia/core @anvia/chroma chromadb
```

Embed documents before writing them; the adapter deliberately disables Chroma's collection embedding function.

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { ChromaVectorStore } from '@anvia/chroma'

const documents = await embedDocuments(embeddings, sourceDocuments, {
  id: (document) => document.id,
  content: (document) => document.text,
})

const store = await ChromaVectorStore.connect({
  client,
  collectionName: 'support_docs',
  createIfMissing: false,
})

await store.upsertDocuments(documents)
const index = store.index(embeddings)
```

`client` may be omitted for a default `ChromaClient`, and collection creation defaults on. Prefer an injected client and pre-provisioned collection outside development.

## Next

- [Collections and indexing](/packages/chroma/collections-and-indexing)
- [Search and filters](/packages/chroma/search-and-filters)
- [Production](/packages/chroma/production)
