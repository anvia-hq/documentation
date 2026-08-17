# Metadata filters

Metadata filters restrict which documents may participate in a vector search. Use them for tenant boundaries, visibility, publication state, product scope, language, and numeric ranges.

## 1. Store filterable fields

Add the required fields when creating embeddings:

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: documents,
    id: (document) => document.id,
    content: (document) => document.text,
    metadata: (document) => ({
        tenantId: document.tenantId,
        product: document.product,
        visibility: document.visibility,
        revision: document.revision,
        published: document.status === 'published',
    })
});
```

Metadata values must be flat strings, numbers, booleans, or `null`. Store stable identifiers and flags rather than entire nested records.

## 2. Build a filter

`vectorFilter` provides equality, greater-than, less-than, AND, and OR expressions:

```ts
import { retrieveDocuments, vectorFilter } from '@anvia/core/vector-store'

const filter = vectorFilter.and(
  vectorFilter.eq('tenantId', request.auth.tenantId),
  vectorFilter.and(
    vectorFilter.eq('product', 'billing'),
    vectorFilter.eq('published', true),
  ),
)

const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query: 'invoice settings',
  topK: 5,
  minScore: 0.72,
  filter,
})
```

Filters are binary expressions, so combine more than two conditions by nesting `and()` or `or()` calls. Use `gt()` and `lt()` only with comparable values of the same type.

## 3. Treat filters as authorization boundaries

Build tenant and visibility filters from authenticated application state. Never let the model choose its tenant ID, workspace, role, or visibility scope.

Apply the same trusted filter wherever the index is exposed:

- direct calls through `retrieveDocuments()`;
- `createVectorContext()` for automatic retrieval; and
- `createVectorSearchTool()` for model-controlled search.

Prompt instructions can tell a model how to use retrieved facts, but they cannot prevent an unauthorized document from entering its context.

## 4. Verify adapter behavior

Persistent adapters translate Anvia filters into their database query language. Test the operators and value types used by your application against the chosen adapter.

Before shipping, test cross-tenant queries, public and private documents, drafts, archived records, missing metadata, and boundary values for numeric comparisons.

Next, choose [automatic retrieval](/sdk/knowledges/automatic-retrieval) or a [search tool](/sdk/knowledges/search-tools).
