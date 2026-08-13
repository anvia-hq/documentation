# Filters and permissions

Filters restrict which indexed documents are eligible before any result reaches the model.

## Store permission metadata

Put access-relevant fields on every indexed document. Prefer explicit fields such as `tenantId`, `visibility`, `product`, and `published` over parsing IDs or paths during a request.

```ts
const embedded = await embedDocuments(embeddingModel, articles, {
  id: (article) => article.id,
  content: (article) => article.text,
  metadata: (article) => ({
    tenantId: article.tenantId,
    visibility: article.visibility,
    product: article.product,
    published: article.status === 'published',
  }),
})
```

## Build filters from trusted state

Create the filter from the authenticated request, not from prompt text or model output.

```ts
import { Agent } from '@anvia/core'
import type { CompletionModel } from '@anvia/core/completion'
import {
  type VectorSearchIndex,
  vectorFilter,
} from '@anvia/core/vector-store'

type SupportArticle = {
  title: string
  body: string
}

export function createSupportAgent(input: {
  model: CompletionModel
  docsIndex: VectorSearchIndex<SupportArticle>
  tenantId: string
}) {
  const filter = vectorFilter.and(
    vectorFilter.eq('tenantId', input.tenantId),
    vectorFilter.eq('visibility', 'support'),
    vectorFilter.eq('published', true),
  )

  return new Agent({
    id: 'tenant-support',
    model: input.model,
    instructions: 'Answer from retrieved support documentation.',
    dynamicContexts: [{ index: input.docsIndex, topK: 5, threshold: 0.72, filter }],
  })
}
```

The route authenticates the user, resolves `tenantId`, and passes it to the factory. The user message contains the question—not the retrieval policy.

## Treat filters as data access

Prompt instructions may tell the model how to use a document, but they are not an authorization boundary. A document the model must never see should be excluded by the index, its adapter, or a trusted metadata filter.

Apply the same scope to every retrieval path. If the same index is also exposed through `index.asTool(...)`, configure an equivalent filter on that tool.

## Compose only supported filters

`vectorFilter.and(...)` and `vectorFilter.or(...)` combine conditions. Equality and numeric range filters are also available, but the selected vector-store adapter determines which operations it can execute.

Keep permission filters mandatory in the factory or data-access layer. Do not allow request code to accidentally omit them.

## Test the boundary

Verify at least these cases:

| Request | Expected retrieval |
| --- | --- |
| Tenant requests its private document | Included |
| Tenant requests another tenant's document | Excluded |
| Tenant requests a public document | Included when policy allows it |
| Request matches a draft or archived document | Excluded |

Also inspect the actual retrieved IDs. A safe-looking final answer does not prove that private context was never sent to the model.

