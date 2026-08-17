# Search and filters

Use `retrieveDocuments()` for both dense and hybrid text retrieval:

```ts
import { retrieveDocuments, vectorFilter } from '@anvia/core/vector-store'

const denseResults = await retrieveDocuments({
  store: denseStore,
  model: dense,
  query: 'reset a password',
  topK: 5,
  minScore: 0.7,
  filter: vectorFilter.eq('tenantId', 'acme'),
})

const hybridResults = await retrieveDocuments({
  store: hybridStore,
  models: { dense, sparse },
  query: 'reset a password',
  topK: 5,
  fusion: 'rrf',
  filter: vectorFilter.eq('tenantId', 'acme'),
})
```

`filterToQdrantFilter()` translates `eq`, `gt`, `lt`, `and`, and `or` into native Qdrant filters for direct client calls.

For raw vector queries, call `store.search({ vector, topK, minScore, filter })`. A hybrid store also exposes `searchHybrid({ vector, sparseVector, fusion, topK, minScore, filter, providerOptions })`; Qdrant's `providerOptions.prefetchLimit` controls candidates per branch.

Tune result count, thresholds, fusion, and prefetch on evaluation data. Metadata filters narrow retrieval but do not replace application authorization.
