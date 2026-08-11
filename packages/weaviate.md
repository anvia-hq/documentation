# @anvia/weaviate

`@anvia/weaviate` stores precomputed Anvia embeddings in a Weaviate collection and exposes vector search through the shared SDK interface.

## Install

```sh
pnpm add @anvia/weaviate @anvia/core @anvia/openai weaviate-client
```

The ESM package includes `weaviate-client` and peers with `@anvia/core >=0.7.1 <1.0.0`.

## Store and search documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { WeaviateVectorStore } from '@anvia/weaviate'
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

const store = await WeaviateVectorStore.connect({
  className: 'SupportDocs',
  vectorSize: 1536,
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

The default client uses `WEAVIATE_HOST` or `localhost:8080` and `WEAVIATE_GRPC_HOST` or `localhost:50051`, with insecure HTTP and gRPC connections. Inject a configured client for any remote or protected deployment.

## Collection ownership

Unless `createIfMissing: false`, `connect()` creates a missing collection with no vectorizer, the selected distance, and Anvia's document ID/document properties. The default distance is `cosine`.

Because Anvia supplies vectors, keep the collection vectorizer disabled. Production infrastructure should own collection creation, replication, vector-index tuning, and property schema; start the adapter with `createIfMissing: false` afterward.

Metadata keys beginning with `__anvia_` are reserved. If metadata properties need an explicit Weaviate schema or indexes, provision them before ingestion.

## Production patterns

- Inject a client configured for TLS, authentication, endpoint discovery, and lifecycle.
- Keep the collection distance aligned with the embedding model.
- Define metadata properties and indexes through schema migrations or deployment automation.
- Control ingestion batch size around provider and network limits.
- Keep authorization in the application even when retrieval uses filters.

## Reference

- [API reference](/packages/weaviate/api-reference)
- [Vector stores](/sdk/knowledges/vector-stores)
- [Automatic retrieval](/sdk/knowledges/automatic-retrieval)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-weaviate)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-weaviate/CHANGELOG.md)
