# Search and filters

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { vectorFilter } from '@anvia/core/vector-store';
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'reset a password',
    topK: 10,
    filter: vectorFilter.or(vectorFilter.eq('tier', 'public'), vectorFilter.gt('priority', 3))
});
```

The adapter has no server-side filter translator. It runs vector search first and applies the filter afterwards with core's `matchesVectorFilter`, which evaluates `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, and n-ary `and`/`or` against each candidate's metadata. An empty `in` list matches nothing rather than throwing because evaluation is local.

When a filter eliminates candidates, the store widens its candidate limit until `topK` results survive, the table runs out of rows, or `minScore` excludes the remainder. The vector query itself is unfiltered, so filtering still happens after the database has selected nearest neighbors.

Filters match against the metadata stored at ingestion, so give filtered documents metadata up front. Retrieval filters do not replace authorization.

Search scores are `1 - distance` for cosine (the default) and `-distance` for L2 and dot distances; they are meaningful only for the selected distance and corpus.
