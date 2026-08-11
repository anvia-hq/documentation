# Add context

Attach a prepared vector index to an agent with `.dynamicContext(...)`.

## Prepare the index first

Dynamic context searches an existing `VectorSearchIndex`. Load, chunk, embed, and store documents before serving agent requests.

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { InMemoryVectorStore } from '@anvia/core/vector-store'

const embedded = await embedDocuments(embeddingModel, articles, {
  id: (article) => article.slug,
  content: (article) => `${article.title}\n${article.body}`,
  metadata: (article) => ({
    product: article.product,
    published: article.published,
  }),
})

const docsIndex = InMemoryVectorStore
  .fromDocuments(embedded)
  .index(embeddingModel)
```

The in-memory store is useful for local development and small fixed corpora. Use a persistent vector-store adapter when the corpus must survive restarts or grow independently of the application process.

Do not rebuild the index for every message. Run ingestion during startup, in an admin workflow, or in a background worker.

## Attach it to an agent

```ts
import { AgentBuilder } from '@anvia/core'

const agent = new AgentBuilder('docs-support', model)
  .instructions(
    'Answer from retrieved documentation. Say when the documentation does not contain the answer.',
  )
  .dynamicContext(docsIndex, {
    topK: 4,
    threshold: 0.74,
  })
  .build()
```

`topK` limits how many results may be included. `threshold` rejects matches below the configured similarity score.

## Run the agent normally

```ts
const result = await agent
  .prompt('How long does a password reset link remain valid?')
  .send()

console.log(result.output)
```

No retrieval call is needed in the route or prompt handler. Anvia searches the index before each model turn.

## What happens during a turn

1. Anvia derives retrieval text from the current prompt.
2. The index searches for similar documents.
3. The configured threshold and metadata filter narrow the results.
4. Results are converted into model documents.
5. Up to `topK` documents are sent with the completion request.

If the model calls a tool and continues, the next turn performs a new search using the updated runtime prompt.

## Start with conservative limits

Begin with three to five short chunks. Increase `topK` only when answers consistently require evidence from more passages. Raise `threshold` when unrelated documents appear; revisit chunking when the right facts are split across poor boundaries.

