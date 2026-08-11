# Embeddings

Use `embeddingModel(...)` to create vectors for knowledge ingestion, semantic retrieval, clustering, or similarity workflows.

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

export const embeddingModel = mistral.embeddingModel(
  'mistral-embed',
  {
    dimensions: 1024,
    maxBatchSize: 512,
  },
)
```

## Embed text

```ts
import { embedText, embedTexts } from '@anvia/core/embeddings'

const query = await embedText(embeddingModel, 'refund timeline')

const documents = await embedTexts(embeddingModel, [
  'Refunds are reviewed within two business days.',
  'Password reset links expire after 30 minutes.',
])
```

The adapter returns one embedding per input and restores provider results to input order. It rejects missing, duplicate, out-of-range, or malformed response rows instead of silently pairing a vector with the wrong text.

## Configure dimensions once

`dimensions` records the expected vector width and sends it to the provider. It must match the vector-store schema used for both document ingestion and query embedding. Changing the model or dimensions normally requires a new index or a full re-embedding migration.

`maxBatchSize` controls how many texts the adapter sends in one Mistral embedding request. The adapter splits larger arrays into sequential batches. This setting does not limit application-level worker concurrency; bound that separately against provider and vector-store capacity.

## Keep ingestion and query aligned

Bind one configured embedding model to the index it belongs to:

```ts
export const supportIndex = vectorStore.index(embeddingModel)
```

Use the same boundary for document ingestion and query search so model ID, dimensions, and index schema cannot drift independently. See [Knowledges](/sdk/knowledges) for the complete ingestion and retrieval flow.
