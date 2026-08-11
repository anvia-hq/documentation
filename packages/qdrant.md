# @anvia/qdrant

`@anvia/qdrant` supports dense and hybrid dense-plus-sparse retrieval over Qdrant collections.

## Install

```sh
pnpm add @anvia/qdrant @anvia/core @anvia/openai @qdrant/js-client-rest
```

The ESM package includes the Qdrant REST client and peers with `@anvia/core >=0.7.1 <1.0.0`.

## Dense retrieval

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { QdrantVectorStore } from '@anvia/qdrant'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
const embeddings = openai.embeddingModel('text-embedding-3-small')
const sourceDocuments = [
  {
    id: 'password-reset',
    text: 'Password reset links expire after 30 minutes.',
  },
]

const documents = await embedDocuments(embeddings, sourceDocuments, {
  id: (document) => document.id,
  content: (document) => document.text,
})

const store = await QdrantVectorStore.connect({
  collectionName: 'support_docs',
  vectorSize: 1536,
  distance: 'Cosine',
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

## Hybrid retrieval

Create the collection and index in hybrid mode, then ingest documents containing aligned dense and sparse embeddings. In this example, `dense`, `sparse`, and `hybridDocuments` are produced by the SDK's hybrid embedding workflow:

```ts
const store = await QdrantVectorStore.connect({
  collectionName: 'support_docs_hybrid',
  vectorSize: 1536,
  hybrid: true,
})

await store.upsertDocuments(hybridDocuments)

const index = store.index({
  dense,
  sparse,
  fusion: 'rrf',
  prefetchLimit: 40,
})
```

Hybrid collections default to named vectors `dense` and `sparse`; fusion defaults to `rrf`, with `dbsf` also supported. Dense-only and hybrid store/index modes cannot be mixed.

## Collection ownership

By default, the adapter reads an existing collection or creates one with the configured dimension and distance. Production deployments should create collections, payload indexes, replication, and storage settings through infrastructure automation, then use `createIfMissing: false`.

Keys beginning with `__anvia_` are reserved in payload metadata. Keep configured dense and sparse vector names identical during creation, ingestion, and query.

## Production patterns

- Inject an authenticated Qdrant client with explicit endpoint and transport settings.
- Choose dense versus hybrid before ingesting the collection.
- Tune hybrid prefetch independently from final `topK`.
- Add payload indexes for common metadata filters.
- Treat collection or payload filters as retrieval boundaries, not application authorization.

## Reference

- [API reference](/packages/qdrant/api-reference)
- [Embeddings](/sdk/knowledges/embeddings)
- [Search tools](/sdk/knowledges/search-tools)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-qdrant)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-qdrant/CHANGELOG.md)
