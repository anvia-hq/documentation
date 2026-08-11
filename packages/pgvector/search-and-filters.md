# Search and filters

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const results = await store.index(embeddings).search({
  query: 'reset a password',
  topK: 5,
  filter: vectorFilter.and(
    vectorFilter.eq('tenantId', 'acme'),
    vectorFilter.gt('revision', 3),
  ),
})
```

`filterToPgVectorWhere` produces parameterized SQL and values. Equality serializes the metadata value for JSONB comparison; `gt` and `lt` require numeric metadata and reject other types.

Cosine scores are `1 - distance`. L2 and inner-product scores are `-distance`; for inner product this negates pgvector's negative-inner-product operator result. Treat the result as adapter ranking data and calibrate any thresholds per metric.

Add JSONB or expression indexes for frequent filters. Database filters still require independent authorization.
