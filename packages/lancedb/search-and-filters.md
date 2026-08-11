# Search and filters

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const results = await store.index(embeddings).search({
  query: 'reset a password',
  topK: 10,
  filter: vectorFilter.or(
    vectorFilter.eq('tier', 'public'),
    vectorFilter.gt('priority', 3),
  ),
})
```

The adapter translates `eq`, `gt`, `lt`, `and`, and `or` to a Lance SQL expression. It escapes string literals, renders booleans as `TRUE` or `FALSE`, and uses `IS NULL` for equality with `null`.

Filter keys become identifiers in the expression, so use application-defined metadata names rather than arbitrary user input. Retrieval filters do not replace authorization.

Search scores are `1 - distance` and are meaningful only for the selected distance and corpus.
