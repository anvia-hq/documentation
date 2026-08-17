# Automatic retrieval

Automatic retrieval searches an index before each model turn and adds relevant results to the agent's context. Use it when most prompts benefit from the same knowledge collection.

## 1. Create a context index

In v1, combine a `VectorStore` with its embedding model through `createVectorContext()` and place it in the agent's `context` array:

```ts
import { Agent, createVectorContext } from '@anvia/core';
import { vectorFilter } from '@anvia/core/vector-store';
const docsContext = createVectorContext({
    store: docsIndex,
    model: embeddingModel,
    topK: 4,
    minScore: 0.74,
    filter: vectorFilter.eq('published', true)
});
const agent = new Agent({
    id: 'docs-support',
    model,
    instructions: 'Answer from retrieved documentation when it is relevant.',
    context: [docsContext],
});
```

`dynamicContexts` is not a v1 agent option. Static documents and retrieval-backed indexes both belong in `context`.

For each model turn, Anvia takes retrieval text from the current prompt, embeds it, searches the store, applies `topK`, `minScore`, and `filter`, then sends the matching documents to the model. Tool results and steering messages can therefore produce different retrieval on a later turn.

## 2. Scope retrieval per caller

Build the agent or context index from trusted request state when the filter depends on the caller:

```ts
function createSupportAgent(tenantId: string) {
    const tenantContext = createVectorContext({
        store: docsIndex,
        model: embeddingModel,
        topK: 4,
        minScore: 0.74,
        filter: vectorFilter.and(vectorFilter.eq('tenantId', tenantId), vectorFilter.eq('published', true))
    });
    return new Agent({
        id: 'tenant-support',
        model,
        instructions: 'Use the supplied documentation. Say when it is insufficient.',
        context: [tenantContext],
    });
}
const agent = createSupportAgent(request.auth.tenantId);
```

Do not accept the tenant filter from model output or an unverified request field.

## 3. Format retrieved results

By default, string documents are used directly and objects are JSON-formatted. Metadata becomes string-valued `additionalProps`.

Use `format()` when the stored record needs a more concise or source-aware `Document`:

```ts
const policyContext = createVectorContext({
    store: policyIndex,
    model: embeddingModel,
    topK: 3,
    minScore: 0.76,
    format: (result) => ({
        id: `policy:${result.id}`,
        text: [
            `Title: ${result.metadata?.title ?? 'Untitled'}`,
            `Source: ${result.metadata?.source ?? 'unknown'}`,
            '',
            result.document.body,
        ].join('\n'),
        additionalProps: {
            source: String(result.metadata?.source ?? 'unknown'),
        },
    })
});
```

The formatter must return an Anvia `Document` with an `id` and `text`.

## 4. Tune retrieval with real prompts

Lower `topK` when extra context distracts the model. Raise `minScore` when weak matches appear. Improve chunking when a result contains unrelated topics, and tighten metadata filters when stale or unauthorized records are eligible.

Use a [search tool](/sdk/knowledges/search-tools) instead when retrieval is optional or the model should refine its search query.
