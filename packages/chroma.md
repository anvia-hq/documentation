# @anvia/chroma

`@anvia/chroma` stores Anvia embedded documents in ChromaDB and exposes them through the SDK's vector-search interface.

## Install

```sh
pnpm add @anvia/chroma @anvia/core @anvia/openai chromadb
```

The package is ESM-only, includes `chromadb`, and peers with `@anvia/core >=0.7.1 <1.0.0`.

## Store and search documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { ChromaVectorStore } from '@anvia/chroma'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
const embeddings = openai.embeddingModel('text-embedding-3-small')
const sourceDocuments = [
  {
    id: 'password-reset',
    text: 'Password reset links expire after 30 minutes.',
    category: 'account',
  },
]

const documents = await embedDocuments(embeddings, sourceDocuments, {
  id: (document) => document.id,
  content: (document) => document.text,
  metadata: (document) => ({ category: document.category }),
})

const store = await ChromaVectorStore.connect({
  collectionName: 'support_docs',
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

The index also implements `searchIds()` and `asTool()`. See [Vector stores](/sdk/knowledges/vector-stores) and [Search tools](/sdk/knowledges/search-tools).

## Collection ownership

With the default `createIfMissing: true`, `connect()` gets or creates the collection. It supplies `embeddingFunction: null` because Anvia writes precomputed embeddings, and defaults collection metadata to cosine space.

For production, provision the collection with your infrastructure workflow and use:

```ts
const store = await ChromaVectorStore.connect({
  client,
  collectionName: 'support_docs',
  createIfMissing: false,
})
```

Pass `metadata` or `configuration` when Studio should create the collection with explicit Chroma settings. Keep those settings compatible with the embedding model used to produce stored vectors.

## Production patterns

- Inject an authenticated, application-managed Chroma client instead of relying on the no-argument default client.
- Keep collection creation in deployment infrastructure and fail startup when it is missing.
- Preserve stable document IDs so repeated ingestion updates the same vector records.
- Reserve capacity and retention around the number of embeddings, not only source documents.
- Apply metadata filters for tenant or corpus boundaries; filters are not a substitute for authorization.

## Reference

- [API reference](/packages/chroma/api-reference)
- [Embeddings](/sdk/knowledges/embeddings)
- [Metadata filters](/sdk/knowledges/metadata-filters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-chroma)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-chroma/CHANGELOG.md)
