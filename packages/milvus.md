# @anvia/milvus

`@anvia/milvus` connects Anvia embedded documents to Milvus and exposes dense similarity search through the SDK vector-search contract.

## Install

```sh
pnpm add @anvia/milvus @anvia/core @anvia/openai @zilliz/milvus2-sdk-node
```

The ESM package includes the Milvus Node SDK and peers with `@anvia/core >=0.7.1 <1.0.0`.

## Store and search documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { MilvusVectorStore } from '@anvia/milvus'
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

const store = await MilvusVectorStore.connect({
  collectionName: 'support_docs',
  vectorSize: 1536,
  metric: 'COSINE',
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

Without a client, the adapter creates a Milvus client for `localhost:19530`.

## Collection and index ownership

By default, `connect()` creates a missing collection with Anvia document fields and a float vector field, then creates an HNSW index and loads the collection. The default metric is `COSINE`. With `createIfMissing: false`, creation is skipped and loading the configured collection must succeed.

Treat automatic creation as a development baseline. Production deployments should provision the collection and index explicitly so shard, consistency, index, and capacity settings are reviewed and repeatable.

Metadata fields are written alongside reserved Anvia fields. Keys beginning with `__anvia_` are rejected.

## Production patterns

- Inject a configured Milvus client with authentication, TLS, and lifecycle owned by the application.
- Keep collection dimension and metric aligned with the embedding model.
- Build and tune indexes through deployment automation for the expected corpus size and latency target.
- Batch ingestion at an application-controlled size and monitor collection load state.
- Use metadata filters as retrieval constraints, not access-control enforcement.

## Reference

- [API reference](/packages/milvus/api-reference)
- [Vector stores](/sdk/knowledges/vector-stores)
- [Search tools](/sdk/knowledges/search-tools)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-milvus)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-milvus/CHANGELOG.md)
