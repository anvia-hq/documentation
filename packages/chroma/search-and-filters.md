# Search and filters

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { vectorFilter } from '@anvia/core/vector-store';
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 5,
    filter: vectorFilter.and(vectorFilter.eq('tenantId', 'acme'), vectorFilter.gt('revision', 3))
});
```

`filterToChromaWhere` maps `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `and`, and `or` to Chroma
`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$and`, and `$or` expressions. `and` and `or` are
n-ary. Chroma rejects logical operators with fewer than two expressions, so the adapter unwraps a
single-child `and`/`or` and throws for an empty logical list or an empty `in` list. Metadata must use
values accepted by both Anvia's vector metadata contract and Chroma.

To expose retrieval as an agent tool, build one with `createVectorSearchTool()` from `@anvia/core/vector-store`. Filters narrow retrieval; authorize tenant and document access separately.
