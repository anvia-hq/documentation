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
  filter: vectorFilter.eq('tenantId', 'acme'),
})
```

`filterToQdrantFilter` translates `eq`, `gt`, `lt`, `and`, and `or` into Qdrant `must`, `should`, match, and range clauses.

Hybrid `prefetchLimit` controls how many candidates each dense and sparse branch contributes before fusion; final `topK` controls returned logical results. Tune both on evaluation data. Filters still require independent authorization.
