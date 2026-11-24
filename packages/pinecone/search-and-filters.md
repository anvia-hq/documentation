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

`filterToPineconeFilter` maps `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `and`, and `or` to
Pinecone's `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$and`, and `$or` structure. `and` and
`or` are n-ary. An empty `in` list throws a descriptive error.

Search is always executed inside the namespace chosen at connection time. Results from several physical embeddings are collapsed to the highest-scoring logical document.

Filterable metadata must conform to Pinecone's accepted value types. Treat namespaces and filters as retrieval controls, not proof that the current user may access a document.
