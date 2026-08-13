# Search and filters

Dense search accepts the standard request. Hybrid search adds index configuration:

```ts
const index = store.index({
  dense,
  sparse,
  fusion: 'rrf',
  prefetchLimit: 40,
})

const results = await index.search({
  query: 'reset a password',
  topK: 5,
  threshold: 0.7,
  filter: vectorFilter.eq('tenantId', 'acme'),
})
```

`filterToQdrantFilter` translates `eq`, `gt`, `lt`, `and`, and `or` into Qdrant `must`, `should`, match, and range clauses.

For dense search, `threshold` is sent to Qdrant as `score_threshold` and is also enforced while
normalizing results. For hybrid search it applies to the final fused score rather than either
retriever's similarity scale.

Hybrid `prefetchLimit` controls how many candidates each dense and sparse branch contributes before
fusion; final `topK` controls returned logical results. Tune both on evaluation data. Filters still
require independent authorization.
