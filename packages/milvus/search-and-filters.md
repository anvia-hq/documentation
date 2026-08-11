# Search and filters

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const results = await store.index(embeddings).search({
  query: 'reset a password',
  topK: 5,
  filter: vectorFilter.and(
    vectorFilter.eq('tenantId', 'acme'),
    vectorFilter.lt('expiresAt', 10),
  ),
})
```

`filterToMilvusExpr` translates equality, numeric comparisons, and nested `and`/`or` expressions into Milvus syntax. String literals are quoted and escaped; booleans and numbers use provider literals.

Search requests use the collection metric chosen at connection time. Score interpretation therefore depends on Milvus and the metric. Test ranking and thresholds on representative data.

Never pass unrestricted user-supplied metadata keys into a filter, and enforce authorization separately.
