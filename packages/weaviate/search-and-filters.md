# Search and filters

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const results = await store.index(embeddings).search({
  query: 'reset a password',
  topK: 5,
  filter: vectorFilter.and(
    vectorFilter.eq('tenantId', 'acme'),
    vectorFilter.lt('revision', 10),
  ),
})
```

`filterToWeaviateWhere` emits `Equal`, `GreaterThan`, `LessThan`, `And`, and `Or` structures, selecting string, integer/number, or boolean value fields from the metadata value.

Search uses the collection's `nearVector` query with a result limit. Scores are derived from Weaviate distance, so thresholds depend on the configured metric and corpus.

Provision metadata properties and indexes before filtering on them. Provider filters are not authorization checks.
