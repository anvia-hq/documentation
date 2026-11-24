# Search and filters

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { vectorFilter } from '@anvia/core/vector-store';
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 5,
    filter: vectorFilter.and(vectorFilter.eq('tenantId', 'acme'), vectorFilter.lt('revision', 10))
});
```

`filterToWeaviateWhere` emits `Equal`, `NotEqual`, `GreaterThan`, `GreaterThanEqual`, `LessThan`,
`LessThanEqual`, and `ContainsAny` structures for the comparison and membership operators, with
n-ary `And`/`Or` for combinators. An empty `in` list or a `null` value inside `in` throws a
descriptive error.

Search uses the collection's `nearVector` query with a result limit. Scores are derived from Weaviate distance, so thresholds depend on the configured metric and corpus.

Provision metadata properties and indexes before filtering on them. Provider filters are not authorization checks.
