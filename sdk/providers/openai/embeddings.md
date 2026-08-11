# Embeddings

Use `embeddingModel(...)` to turn text into vectors for ingestion, retrieval, clustering, or semantic search.

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const embeddingModel = openai.embeddingModel(
  'text-embedding-3-small',
  {
    dimensions: 1536,
    maxBatchSize: 512,
    user: 'tenant-123',
  },
)
```

## Embed application text

```ts
import { embedText, embedTexts } from '@anvia/core/embeddings'

const query = await embedText(embeddingModel, 'refund timeline')

const documents = await embedTexts(embeddingModel, [
  'Refunds are reviewed within two business days.',
  'Password reset links expire after 30 minutes.',
])
```

The adapter returns one embedding for each input, preserves input order, and rejects mismatched provider response counts or indexes rather than returning silently misaligned vectors.

## Configure dimensions once

`dimensions` changes the vector width for models that support it. The value must match the vector-store schema used for both document ingestion and query embedding. Changing it normally requires a new index or a full re-embedding migration.

`maxBatchSize` controls how many texts the model receives per provider request. It is a request batching limit, not a concurrency limit. Bound worker concurrency separately to stay within provider and database capacity.

The optional `user` value is forwarded as provider metadata. Use a stable, non-sensitive identifier rather than an email address or raw customer name.

## Build a retrieval boundary

Keep one configured embedding model with the index it belongs to:

```ts
export const supportIndex = vectorStore.index(embeddingModel)
```

Ingestion and query code should share that boundary so model ID, dimensions, normalization assumptions, and store schema cannot drift independently. See [Knowledges](/sdk/knowledges) for the complete ingestion and retrieval flow.

