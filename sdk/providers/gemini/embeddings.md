# Embeddings

Use `embeddingModel(...)` to create vectors for retrieval, semantic similarity, classification, clustering, and related workloads.

```ts
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

export const documentEmbeddings = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    taskType: 'RETRIEVAL_DOCUMENT',
    dimensions: 768,
    maxBatchSize: 100
})
```

## Embed text

```ts
const embeddings = await documentEmbeddings.embedTexts([
  'Refunds take five business days.',
  'Password reset links expire after 30 minutes.',
])

for (const embedding of embeddings) {
  console.log(embedding.document, embedding.vector.length)
}
```

The adapter preserves input order and returns one `{ document, vector }` result for each input. It splits large input arrays into provider calls according to `maxBatchSize`, which defaults to `100`.

## Match task types

For retrieval, configure separate model objects for indexed documents and search queries:

```ts
const documentEmbeddings = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    taskType: 'RETRIEVAL_DOCUMENT',
    dimensions: 768
})

const queryEmbeddings = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    taskType: 'RETRIEVAL_QUERY',
    dimensions: 768
})
```

Keep the model ID and output dimensions identical between indexed documents and queries. Changing either requires re-embedding the stored collection.

Supported adapter task values are:

- `RETRIEVAL_QUERY` and `RETRIEVAL_DOCUMENT`
- `SEMANTIC_SIMILARITY`
- `CLASSIFICATION` and `CLUSTERING`
- `QUESTION_ANSWERING` and `FACT_VERIFICATION`
- `CODE_RETRIEVAL_QUERY`
- `TASK_TYPE_UNSPECIFIED`

The selected Google model must support the requested task type.

## Model options

`dimensions` sends Google's output dimensionality and exposes it on the Anvia model. `maxBatchSize` limits texts per provider request. `taskType` declares the workload. `title` supplies one shared document title in the embedding configuration.

Use `title` only where one title meaningfully applies to the texts sent through that model instance. For document collections with different titles, create appropriately scoped models or omit the shared option.

## Production boundaries

Exclude secrets and private fields before embedding. Keep stable document IDs, permission metadata, model ID, dimensions, and task configuration with the ingestion version. Embeddings are derived data, but they still need access control and retention policies.
