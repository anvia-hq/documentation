# Embedding models

Embedding models turn text into numeric vectors. Retrieval uses those vectors to compare a query with prepared documents.

## Create an embedding model

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const embeddingModel = openai.embeddingModel(
  'text-embedding-3-small',
)
```

OpenAI, Gemini, and Mistral provide hosted embedding models. `@anvia/fastembed` and `@anvia/transformers` provide local alternatives.

## Embed text

```ts
import { embedText, embedTexts } from '@anvia/core/embeddings'

const query = await embedText(embeddingModel, 'refund policy')

const documents = await embedTexts(embeddingModel, [
  'Refunds are reviewed within two business days.',
  'Password reset links expire after 30 minutes.',
])
```

`embedTexts(...)` respects the model's batch size and preserves input order.

## Embed documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'

const embedded = await embedDocuments(embeddingModel, articles, {
  id: (article) => article.slug,
  content: (article) => `${article.title}\n${article.body}`,
  metadata: (article) => ({
    product: article.product,
    published: article.published,
  }),
})
```

Keep stable IDs and permission-relevant metadata. Exclude or redact secrets before embedding; prompt instructions are not an authorization boundary.
