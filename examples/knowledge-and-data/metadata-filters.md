# Design metadata filters

**Level:** Pattern · **Estimated time:** 25 minutes

## Outcome

Combine exact, numeric, and logical predicates to narrow vector search before ranking results.

## When to use it

Use filters for eligibility such as tenant, publication state, language, product, or date bucket.
Do not encode every concept as metadata: semantic subject matter belongs in the embedded content.

## Flow and setup

Write flat metadata during `embedDocuments`, derive a trusted filter for the request, then pass it
to `index.search`. Supported operators are expressed through `vectorFilter` rather than a
backend-specific query string.

```ts
import { vectorFilter } from "@anvia/core/vector-store";

const filter = vectorFilter.and(
  vectorFilter.eq("tenantId", principal.tenantId),
  vectorFilter.eq("status", "published"),
  vectorFilter.or(
    vectorFilter.eq("locale", requestedLocale),
    vectorFilter.eq("locale", "en"),
  ),
  vectorFilter.gt("priority", 2),
);

const results = await index.search({ query, topK: 10, filter });
```

Use only validated application values. A model-generated filter can help propose a search facet,
but an authorization filter must always be independently added by trusted code.

## Expected behavior

Filtering happens before the final `topK` set. A semantically perfect record that fails any `and`
predicate is absent. Inspect returned metadata during development, but do not expose private fields
to the caller automatically.

## Failure cases

Inconsistent types (`"3"` versus `3`), missing fields, deeply nested policy, backend operator gaps,
and high-cardinality metadata can make results surprising. Qualify the exact adapter and schema you
deploy.

## Security and ownership

The application owns metadata truth and filter construction. Keep authorization predicates
separate from optional user facets so omitting a facet cannot omit tenant scope. For strong
isolation, pair filters with namespaces or database policies.

## Production changes and tests

Version the metadata schema, validate records before embedding, centralize mandatory predicates,
and add adapter contract tests. Test every operator, missing fields, type mismatch, conflicting
facets, forbidden nearest-neighbor canaries, and empty result sets.

## Runnable reference

- [Filters and LSH](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/02-filters-and-lsh.ts)

## Extensions

Add temporal windows, role visibility, locale fallback, filter observability without private
values, and [permission-aware RAG](/examples/knowledge-and-data/permission-aware-rag).
