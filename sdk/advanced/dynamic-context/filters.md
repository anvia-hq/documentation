# Filters and permissions

Metadata filters restrict which indexed documents are eligible before any result reaches the model.

## 1. Store access-relevant metadata

Put explicit permission fields on every embedded record:

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: articles,
    id: (article) => article.id,
    content: (article) => article.text,
    metadata: (article) => ({
        tenantId: article.tenantId,
        visibility: article.visibility,
        product: article.product,
        published: article.status === 'published',
    })
});
```

Prefer stable tenant IDs, visibility values, and publication flags over parsing access rules from paths or document text during a request.

## 2. Build filters from trusted state

Create the context index inside a factory that receives authenticated application state:

```ts
import { Agent, createVectorContext } from '@anvia/core';
import type { CompletionModel } from '@anvia/core/completion';
import type { EmbeddingModel } from '@anvia/core/embeddings';
import { type VectorStore, vectorFilter, } from '@anvia/core/vector-store';
type SupportArticle = {
    title: string;
    body: string;
};
export function createSupportAgent(input: {
    model: CompletionModel;
    embeddingModel: EmbeddingModel;
    docsStore: VectorStore<SupportArticle>;
    tenantId: string;
}) {
    const filter = vectorFilter.and(vectorFilter.eq('tenantId', input.tenantId), vectorFilter.and(vectorFilter.eq('visibility', 'support'), vectorFilter.eq('published', true)));
    const context = createVectorContext({
        store: input.docsStore,
        model: input.embeddingModel,
        topK: 5,
        minScore: 0.72,
        filter
    });
    return new Agent({
        id: 'tenant-support',
        model: input.model,
        instructions: 'Answer from retrieved support documentation.',
        context: [context],
    });
}
```

The route authenticates the caller, resolves the tenant ID, and passes it into the factory. The user message contains the question, not the retrieval policy.

## 3. Treat filters as data access

A prompt instruction is not an authorization boundary. Documents the model must never see must be excluded by the index, its adapter, or a trusted filter.

Apply the same access scope to every path into the index. If it is also exposed with `index.asTool()`, configure an equivalent trusted filter on that tool.

`vectorFilter.and()` and `vectorFilter.or()` each combine two filters, so nest them for additional conditions. Equality, greater-than, and less-than expressions are available; test the exact value types and operations against the chosen vector-store adapter.

## 4. Test the boundary directly

Verify that a tenant can retrieve its permitted private record, cannot retrieve another tenant's record, receives public records only when policy allows, and cannot retrieve drafts or archived content.

Inspect the actual retrieved IDs and formatted documents during tests. A safe-looking final answer does not prove that private context was never sent to the model.

Next, combine independently governed sources with [multiple indexes](/sdk/advanced/dynamic-context/multiple-indexes).
