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

`filterToMilvusExpr` translates equality, numeric comparisons, and nested `and`/`or` expressions into Milvus syntax. String literals are quoted and escaped; booleans and numbers use provider literals.

Search requests use the collection metric chosen at connection time. Score interpretation therefore depends on Milvus and the metric. Test ranking and thresholds on representative data.

`filterToMilvusExpr` validates filter input before building an expression. Keys must match the identifier pattern `^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$` (letters, digits, and underscores, with dots for nested fields), no dot-separated segment may be a reserved Milvus expression keyword such as `and`, `or`, `in`, `like`, `text_match`, or `phrase_match`, and numeric values must be finite. Since 1.0.10, invalid input throws a descriptive error instead of forwarding attacker-shaped strings to Milvus.

Filters are retrieval constraints, not authorization; keep access checks in the service layer.
