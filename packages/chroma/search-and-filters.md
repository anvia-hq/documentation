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

`filterToChromaWhere` maps `eq`, `gt`, `lt`, `and`, and `or` to Chroma `$eq`, `$gt`, `$lt`, `$and`, and `$or` expressions. Metadata must use values accepted by both Anvia's vector metadata contract and Chroma.

To expose retrieval as an agent tool, build one with `createVectorSearchTool()` from `@anvia/core/vector-store`. Filters narrow retrieval; authorize tenant and document access separately.
