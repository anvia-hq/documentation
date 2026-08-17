# Dynamic context

Dynamic context retrieves relevant documents before each agent model turn. It gives the model focused evidence without sending an entire corpus with every request.

```text
Current prompt -> vector search -> filter -> format -> model documents
```

In v1, dynamic context is represented by `createVectorContext({ store, model, ... })`. Static documents and retrieval-backed vector contexts both belong in the agent's `context` array.

## 1. Add automatic retrieval

```ts
import { Agent, createVectorContext } from '@anvia/core';
import { vectorFilter } from '@anvia/core/vector-store';
const docsContext = createVectorContext({
    store: docsIndex,
    model: embeddingModel,
    topK: 5,
    minScore: 0.72,
    filter: vectorFilter.eq('published', true)
});
const agent = new Agent({
    id: 'docs-support',
    model,
    instructions: 'Use retrieved documentation when it is relevant.',
    context: [docsContext],
});
```

`docsIndex` must implement `VectorStore`. Prepare and populate it outside the request path; see [Knowledges](/sdk/knowledges) for ingestion, embeddings, and vector stores.

## 2. Understand turn-by-turn retrieval

Before a model turn, Anvia derives retrieval text from the current prompt and searches each context index. Matching results are formatted as documents and included in that turn's provider request.

Retrieval runs again when a tool result or steering message creates another turn. The next search can therefore return different evidence.

## 3. Choose the right source boundary

Use static `context` documents for a small set of facts that is safe and useful on every turn.

Use `createVectorContext()` for relevant documents selected automatically on each turn.

Use `createVectorSearchTool()` when search is optional or the model should refine its query.

Use a scoped application tool for live account state, permission checks, and actions. Retrieved vector data can be stale and must not authorize a side effect.

## 4. Continue through the section

- [Add a context index](/sdk/advanced/dynamic-context/add-context)
- [Format retrieved results](/sdk/advanced/dynamic-context/formatting)
- [Enforce filters and permissions](/sdk/advanced/dynamic-context/filters)
- [Combine multiple indexes](/sdk/advanced/dynamic-context/multiple-indexes)
