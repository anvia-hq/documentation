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

`filterToPgVectorWhere` produces parameterized SQL and values. `eq` serializes the metadata value
for JSONB comparison; `ne` uses a null-safe `IS DISTINCT FROM` comparison. `gt`, `gte`, `lt`, and
`lte` cast the stored value to `numeric` and reject non-numeric filter values. `in` becomes an `ANY`
list and can include `null` to match a stored JSON null. N-ary `and`/`or` become parenthesized SQL
`AND`/`OR`. Empty `in` lists and non-numeric range values throw.

Cosine scores are `1 - distance`. L2 and inner-product scores are `-distance`; for inner product this negates pgvector's negative-inner-product operator result. Treat the result as adapter ranking data and calibrate any thresholds per metric.

Add JSONB or expression indexes for frequent filters. Database filters still require independent authorization.
