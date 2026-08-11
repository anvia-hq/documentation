# Metadata filters

Metadata filters constrain search before documents reach the model. Use them for tenant boundaries, product scopes, visibility, status, and freshness.

## Store filterable metadata

```ts
const embedded = await embedDocuments(embeddingModel, documents, {
  id: (document) => document.id,
  content: (document) => document.text,
  metadata: (document) => ({
    tenantId: document.tenantId,
    product: document.product,
    visibility: document.visibility,
    published: document.status === 'published',
  }),
})
```

Keep metadata flat and explicit. Store IDs and flags rather than large nested records.

## Filter a search

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const filter = vectorFilter.and(
  vectorFilter.eq('tenantId', tenant.id),
  vectorFilter.eq('product', 'billing'),
  vectorFilter.eq('published', true),
)

const results = await index.search({
  query: 'invoice settings',
  topK: 5,
  threshold: 0.72,
  filter,
})
```

Use `or(...)` for allowed alternatives and `gt(...)` or `lt(...)` for numeric ranges supported by the selected adapter.

## Build filters from trusted state

Create tenant and visibility filters from the authenticated request—not model output. Apply the same filter to automatic retrieval and search tools.

Prompt instructions may explain how to use retrieved facts, but they must not decide which documents the model is allowed to receive.

Test filters with private cross-tenant requests, public documents, and draft or archived sources before shipping.
