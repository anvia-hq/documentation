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

`filterToRedisQuery` translates string equality to a quoted field query, booleans to tag values, numbers to exact ranges, comparisons to open numeric ranges, and compounds to RediSearch intersection or union syntax.

Metadata fields must be represented by compatible index fields. Automatic creation defines Anvia's baseline fields; provision additional filterable schema as required by your Redis design.

Search uses KNN over the configured vector field. Filters narrow candidates but do not authorize documents.
