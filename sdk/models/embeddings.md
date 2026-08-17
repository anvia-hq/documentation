# Embedding models

Embedding models turn text into numeric vectors. Retrieval systems compare those vectors to find semantically related queries, passages, and documents.

## 1. Create an embedding model

The provider client creates a model implementing Anvia's `EmbeddingModel` interface.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })

export const embeddingModel = client.embeddingModel({
    modelId: 'text-embedding-3-small'
})
```

OpenAI, Gemini, and Mistral provide hosted adapters. `@anvia/fastembed` and `@anvia/transformers` provide local alternatives.

## 2. Embed one query

`embedText()` returns the original document text together with its vector.

```ts
import { embedText } from '@anvia/core/embeddings'

const { embedding: query } = await embedText({
  model: embeddingModel,
  text: 'How long do refunds take?',
})

console.log(query.document)
console.log(query.vector.length)
```

Use the same model configuration for documents and their queries. Vectors produced by different models or dimensions are not interchangeable.

## 3. Embed a batch

`embedTexts()` respects the model's declared maximum batch size and preserves input order.

```ts
import { embedTexts } from '@anvia/core/embeddings'

const { embeddings } = await embedTexts({
  model: embeddingModel,
  texts: [
    'Refunds are reviewed within two business days.',
    'Password reset links expire after 30 minutes.',
  ],
})

for (const embedding of embeddings) {
  console.log(embedding.document, embedding.vector.length)
}
```

Anvia throws when a provider returns a different number of vectors than requested, preventing silent input/result misalignment.

## 4. Prepare application documents

`embedDocuments()` keeps the original record with stable IDs, optional metadata, and one or more vectors.

```ts
import { embedDocuments } from '@anvia/core/embeddings';
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: articles,
    id: (article) => article.slug,
    content: (article) => [article.title, article.body],
    metadata: (article) => ({
        product: article.product,
        published: article.published,
    }),
    concurrency: 2
});
```

Returning multiple strings from `content` creates aligned vectors for the same document. The vector store can preserve the original record and metadata alongside them.

## 5. Protect the retrieval boundary

Embedding is not authorization. Before embedding or searching:

- remove secrets and fields that are not needed for retrieval;
- preserve tenant, workspace, visibility, and source identifiers as metadata;
- apply permission filters before returned text enters a prompt; and
- record the embedding model and dimensions with the index.

Re-embed the collection when changing models or dimensions. Do not mix vectors from incompatible model configurations in one search space.

Continue with [Image generation models](/sdk/models/image-generation) or learn how embeddings support [Knowledges](/sdk/knowledges).
