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

Metadata values must be flat strings, numbers, booleans, or `null`. Store stable identifiers and flags rather than entire nested records. Filters only see the metadata stored at ingestion, so a document with no metadata never matches a filter.

## 2. Build a filter

`vectorFilter` provides six comparison operators, membership with `in()`, and variadic `and()`/`or()` combinators. Pass every condition directly to a combinator; nesting is no longer required:

```ts
import { retrieveDocuments, vectorFilter } from '@anvia/core/vector-store'

const filter = vectorFilter.and(
  vectorFilter.eq('tenantId', request.auth.tenantId),
  vectorFilter.ne('status', 'archived'),
  vectorFilter.in('product', ['billing', 'accounts']),
  vectorFilter.gte('revision', 3),
  vectorFilter.lte('revision', 8),
  vectorFilter.or(
    vectorFilter.eq('visibility', 'internal'),
    vectorFilter.gte('priority', 2),
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

## 3. Use the shorthand form

Anywhere a filter is accepted, a plain object is shorthand for the same predicates. A bare value
means equality and a nested object lists field operators:

```ts
const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query: 'invoice settings',
  filter: {
    tenantId: request.auth.tenantId,
    status: { ne: 'archived' },
    product: { in: ['billing', 'accounts'] },
    revision: { gte: 3, lte: 8 },
  },
})
```

Every field must match. The supported operators are `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, and
`in`; use `vectorFilter.and()` and `vectorFilter.or()` when a filter needs explicit grouping.
`normalizeVectorFilter()` converts the shorthand into the canonical `VectorFilter`, and
`isVectorFilter()` narrows an unknown value. `createVectorIndex()`, `retrieveDocuments()`,
`VectorContext`, and vector search tools accept either form.

## 4. Operator semantics

The in-memory matcher defines the reference semantics. Persistent adapters translate the same
predicates to their backend and may apply provider-specific type rules.

| Builder | Matches when |
| --- | --- |
| `eq(key, value)` | The stored value is strictly equal to `value`, including its type (`"3"` and `3` differ). |
| `ne(key, value)` | The stored value is not strictly equal to `value`. A missing key satisfies `ne`; a document with no metadata object does not match any filter. |
| `gt`, `gte`, `lt`, `lte` | Both sides are numbers, both are strings, or both are booleans, and the ordered comparison holds. Strings compare lexicographically and booleans compare `false` before `true`. Missing keys, `null`, and mixed types do not match instead of throwing; the in-memory matcher falls back to a `0` comparison result, which never satisfies `gt` or `lt`. |
| `in(key, values)` | The stored value is strictly equal to one of the listed values. `null` matches only when listed, and a missing key never matches. An empty list matches nothing in the in-memory matcher and in LanceDB; native adapters reject it. |
| `and(...filters)` | Every child filter matches. |
| `or(...filters)` | At least one child filter matches. |

`and()` and `or()` accept one or more children; the `VectorFilterList` type rejects an empty list at
compile time. A single-child combinator is valid and equivalent to its child. Filter values must be
strings, numbers, booleans, or `null`; use finite numbers. Milvus and Redis reject `NaN` and
`Infinity`, and non-finite values are not portable across backends.

The exported types `VectorFilter`, `VectorFilterOperator`, `VectorFilterComparisonOperator`, and
`VectorFilterList` describe these shapes. `matchesVectorFilter(metadata, filter)` evaluates the
in-memory semantics directly when an application needs to test a stored record.

```ts anvia-check vector-filter-example
import { InMemoryVectorStore, vectorFilter } from '@anvia/core/vector-store'

const store = InMemoryVectorStore.fromDocuments({
  metric: 'euclidean',
  documents: [
    {
      id: 'invoice',
      document: 'Invoice settings',
      metadata: {
        tenantId: 'acme',
        product: 'billing',
        status: 'active',
        revision: 4,
        priority: 3,
      },
      embeddings: [{ document: 'Invoice settings', vector: [1, 0] }],
    },
    {
      id: 'accounts',
      document: 'Account settings',
      metadata: {
        tenantId: 'acme',
        product: 'accounts',
        status: 'active',
        revision: 8,
        priority: 2,
      },
      embeddings: [{ document: 'Account settings', vector: [1, 0.2] }],
    },
    {
      id: 'archive',
      document: 'Archived invoice',
      metadata: {
        tenantId: 'acme',
        product: 'billing',
        status: 'archived',
        revision: 9,
        priority: 1,
      },
      embeddings: [{ document: 'Archived invoice', vector: [1, 0.1] }],
    },
  ],
})

const filter = vectorFilter.and(
  vectorFilter.eq('tenantId', 'acme'),
  vectorFilter.ne('status', 'archived'),
  vectorFilter.in('product', ['billing', 'accounts']),
  vectorFilter.gte('revision', 3),
  vectorFilter.lte('revision', 8),
  vectorFilter.or(
    vectorFilter.eq('priority', 2),
    vectorFilter.gte('priority', 3),
  ),
)

const results = await store.search({ vector: [1, 0], topK: 5, filter })
console.log(results.map(({ id }) => id))
```

## 5. Adapter translation

Chroma, Milvus, PgVector, Pinecone, Qdrant, Redis, and Weaviate translate filters natively. LanceDB
has no server-side filter translator: it runs the vector query and then evaluates the same core
matcher against each candidate's metadata.

| Adapter | Translation | `in` rules | `and` / `or` | Rejected combinations |
| --- | --- | --- | --- | --- |
| [Chroma](/packages/chroma) | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in` | Non-empty | `$and` / `$or`; a single child is unwrapped | Empty `in` list; empty logical list |
| [LanceDB](/packages/lancedb) | None; post-retrieval core matcher | Empty list matches nothing | Evaluated by the core matcher | No filter-translation errors |
| [Milvus](/packages/milvus) | `==`, `!=`, `>`, `>=`, `<`, `<=`, `in [...]` | Non-empty; no `null` | Parenthesized `&&` / `\|\|` | Empty or null `in`; invalid key or reserved keyword segment; non-finite number |
| [PgVector](/packages/pgvector) | Bound SQL with null-safe `ne` and `numeric` casts for ranges | Non-empty; `null` supported | Parenthesized `AND` / `OR` | Empty `in`; non-numeric range value |
| [Pinecone](/packages/pinecone) | `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in` | Non-empty | `$and` / `$or` | Empty `in` |
| [Qdrant](/packages/qdrant) | `must`/`must_not` match and `range` conditions | Non-empty; all strings or all integers | `must` / `should` | Empty `in`; booleans, floats, `null`, or mixed types in `in` |
| [Redis](/packages/redis) | TAG equality and numeric ranges | Non-empty; numeric fields use an OR of exact ranges | RediSearch intersection / union | Undeclared field; empty `in`; range on a non-numeric field; non-finite number |
| [Weaviate](/packages/weaviate) | `Equal`, `NotEqual`, `GreaterThan`, `GreaterThanEqual`, `LessThan`, `LessThanEqual`, `ContainsAny` | Non-empty; no `null` | `And` / `Or` | Empty or null `in` |

Adapter-specific errors are descriptive and are raised before the backend query runs. Value-type
support beyond these rules follows the provider: for example, PgVector range filters require numeric
filter values and Qdrant `in` filters accept only a uniform list of strings or integers. Test the
exact operators and value types your application uses against its adapter.

## 6. Treat filters as authorization boundaries

Build tenant and visibility filters from authenticated application state. Never let the model choose its tenant ID, workspace, role, or visibility scope.

Apply the same trusted filter wherever the index is exposed:

- direct calls through `retrieveDocuments()`;
- `createVectorContext()` for automatic retrieval; and
- `createVectorSearchTool()` for model-controlled search.

Prompt instructions can tell a model how to use retrieved facts, but they cannot prevent an unauthorized document from entering its context. Filters narrow retrieval; they do not replace application authorization, row-level security, or namespace isolation.

## 7. Verify adapter behavior

Test the operators and value types used by your application against the chosen adapter.

Before shipping, test cross-tenant queries, public and private documents, drafts, archived records, missing metadata, and boundary values for numeric comparisons. Include each rejected combination your application can construct, such as an empty `in` list or a `null` value in a Weaviate `in` filter.

Next, choose [automatic retrieval](/sdk/knowledges/automatic-retrieval) or a [search tool](/sdk/knowledges/search-tools).
