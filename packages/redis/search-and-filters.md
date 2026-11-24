# Search and filters

```ts
import { retrieveDocuments, vectorFilter } from "@anvia/core/vector-store";
import { RedisVectorClient } from '@anvia/redis';
const store = new RedisVectorClient({}).vectorStore({
    indexName: 'support_docs',
    dimensions: 1536,
    metadataSchema: { tenantId: 'tag', revision: 'numeric' }
});
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 5,
    filter: vectorFilter.and(vectorFilter.eq('tenantId', 'acme'), vectorFilter.gt('revision', 3))
});
```

`filterToRedisQuery` translates string equality to RediSearch TAG syntax `@key:{escaped}`; stored tag
values carry typed prefixes (`s:` strings, `d:` numbers, `b:1`/`b:0` booleans, `n:` null), so
`eq('tenantId', 'acme')` becomes `@tenantId:{s\:acme}`. Numeric equality becomes an exact range,
`ne` negates the equality query, and `gt`/`gte`/`lt`/`lte` become open or closed numeric ranges. `in`
becomes a TAG union or an OR of exact numeric ranges. N-ary `and`/`or` translate to RediSearch
intersection and union syntax.

Filter fields must be declared in the store's `metadataSchema`. Automatic index creation defines only the reserved `__anvia_document_id` TAG field plus the schema-declared fields, and filtering an undeclared key throws a `TypeError` naming `vectorStore({ metadataSchema })`. Tag fields support equality and membership; numeric fields support equality, membership, and ranges, and numeric filters require finite numbers. An empty `in` list or a range filter on a tag field throws a descriptive `TypeError`.

Search uses KNN over the configured vector field. Filters narrow candidates but do not authorize documents.
