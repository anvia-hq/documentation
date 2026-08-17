# Embeddings

Use `embeddingModel(...)` to create vectors for knowledge ingestion, semantic retrieval, clustering, and similarity workflows.

```ts
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})

export const embeddingModel = mistral.embeddingModel({
    modelId: 'mistral-embed',
    dimensions: 1024,
    maxBatchSize: 512
})
```

Both options are optional. The adapter's default `maxBatchSize` is 1024.

## Embed one or many texts

```ts
import { embedText, embedTexts } from '@anvia/core/embeddings'

const { embedding: query } = await embedText({
  model: embeddingModel,
  text: 'refund timeline',
})

const { embeddings: documents } = await embedTexts({
  model: embeddingModel,
  texts: [
    'Refunds are reviewed within two business days.',
    'Password reset links expire after 30 minutes.',
  ],
})

console.log(query.vector)
console.log(documents[0]?.document)
```

Each returned embedding contains the original `document` text and its numeric `vector`.

## Understand batching and ordering

`maxBatchSize` controls how many texts are sent in one Mistral embedding request. Larger input arrays are split into sequential batches.

The adapter restores response rows to input order using their provider indexes. It rejects missing, duplicate, out-of-range, or malformed rows instead of silently pairing a vector with the wrong text.

Application workers can still create concurrent embedding jobs. Bound that concurrency separately according to provider and vector-store capacity.

## Keep dimensions aligned

When `dimensions` is configured, the adapter records that expected width and sends it to Mistral. The value must match the vector-store schema used for both document ingestion and query embedding.

Changing the model or vector dimensions normally requires a new index or a full re-embedding migration. Bind one configured embedding model to one knowledge-index configuration so ingestion and search cannot drift independently.

Continue to [Knowledges](/sdk/knowledges) for the ingestion and retrieval workflow.
