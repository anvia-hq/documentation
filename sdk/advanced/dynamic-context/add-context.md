# Add context

Wrap a prepared `VectorStore` and its embedding model with `createVectorContext()` and add it to the agent's `context` array.

## 1. Prepare the index before requests

Load, chunk, embed, and store documents in an ingestion job:

```ts
import { embedDocuments } from '@anvia/core/embeddings';
import { InMemoryVectorStore } from '@anvia/core/vector-store';
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: articles,
    id: (article) => article.slug,
    content: (article) => `${article.title}\n\n${article.body}`,
    metadata: (article) => ({
        product: article.product,
        published: article.published,
    })
});
const docsStore = InMemoryVectorStore.fromDocuments({ documents: embedded });
```

The in-memory store is useful for tests and small process-local corpora. Use a persistent vector-store adapter when the collection must survive restarts or scale independently.

Do not rebuild or re-embed the corpus for every message.

## 2. Create the retrieval entry

```ts
import { Agent, createVectorContext } from '@anvia/core';
const docsContext = createVectorContext({
    store: docsStore,
    model: embeddingModel,
    topK: 4,
    minScore: 0.74
});
const agent = new Agent({
    id: 'docs-support',
    model,
    instructions: [
        'Answer from retrieved documentation.',
        'Say when the documentation does not contain the answer.',
    ].join('\n'),
    context: [docsContext],
});
```

`topK` is required and must be a positive safe integer. `minScore` is optional and must be finite. Tune it against real results from that store and embedding model.

## 3. Run the agent normally

```ts
const result = await agent.generate({
    prompt: 'How long does a password reset link remain valid?'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

The route does not make a separate retrieval call. Anvia searches the context index before each model turn with non-empty retrieval text.

## 4. Start with a small context budget

Begin with three to five focused chunks. Increase `topK` only when answers consistently need evidence from more passages.

Raise `minScore` when unrelated documents appear. Revisit chunking when the right facts exist but are split across poor boundaries or bundled with unrelated content.

Next, control the exact model document with [formatting](/sdk/advanced/dynamic-context/formatting).
