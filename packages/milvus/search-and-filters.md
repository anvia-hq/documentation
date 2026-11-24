# Search and filters

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { vectorFilter } from '@anvia/core/vector-store';
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 5,
    filter: vectorFilter.and(vectorFilter.eq('tenantId', 'acme'), vectorFilter.lt('expiresAt', 10))
});
```

`filterToMilvusExpr` translates `eq`, `ne`, `gt`, `gte`, `lt`, and `lte` to Milvus `==`, `!=`, `>`,
`>=`, `<`, and `<=`, and `in` to a Milvus list expression. N-ary `and`/`or` become parenthesized
`&&` and `||` expressions. String literals are quoted and escaped; booleans, numbers, and `null` use
provider literals. Empty `in` lists, `null` values inside `in`, invalid keys, reserved keyword
segments, and non-finite numbers throw descriptive errors.

Search requests use the collection metric chosen at connection time. Score interpretation therefore depends on Milvus and the metric. Test ranking and thresholds on representative data.

`filterToMilvusExpr` validates filter input before building an expression. Keys must match the identifier pattern `^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$` (letters, digits, and underscores, with dots for nested fields), no dot-separated segment may be a reserved Milvus expression keyword such as `and`, `or`, `in`, `like`, `text_match`, or `phrase_match`, and numeric values must be finite. Since 1.0.10, invalid input throws a descriptive error instead of forwarding attacker-shaped strings to Milvus.

Filters are retrieval constraints, not authorization; keep access checks in the service layer.
