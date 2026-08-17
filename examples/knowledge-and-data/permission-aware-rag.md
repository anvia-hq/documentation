# Build permission-aware RAG

**Level:** Pattern · **Estimated time:** 40 minutes

## Outcome

Restrict retrieval with a filter derived from an authenticated principal. Relevance ranking happens
only inside the corpus that principal is allowed to see.

## When to use it

Use this for role- or tenant-scoped knowledge. For high-impact isolation, combine filters with
separate namespaces, indexes, or database policy; do not rely on the model to hide forbidden text.

## Request flow

authenticate → authorize `knowledge:read` → derive server-owned scope → `vectorFilter` → search →
format permitted documents → answer. The question never supplies `tenantId`, role, or raw filters.

## Setup and metadata

Store flat filterable metadata at embedding time:

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: documents,
    id: (document) => document.id,
    content: (document) => document.text,
    metadata: (document) => ({
        tenantId: document.tenantId,
        visibility: document.visibility,
        status: document.status,
    })
});
```

## Derive the eligibility filter

```ts
import { retrieveDocuments, vectorFilter } from "@anvia/core/vector-store";

function filterFor(principal: Principal) {
  const visibility = principal.role === "manager"
    ? vectorFilter.or(
        vectorFilter.eq("visibility", "staff"),
        vectorFilter.eq("visibility", "manager"),
      )
    : vectorFilter.eq("visibility", "staff");

  return vectorFilter.and(
    vectorFilter.eq("tenantId", principal.tenantId),
    vectorFilter.and(vectorFilter.eq("status", "published"), visibility),
  );
}

const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query,
  topK: 5,
  filter: filterFor(principal),
});
```

The same filter can be passed to `createVectorContext({ store, model, topK, filter })` and included in the
agent's `context` array.

## Expected behavior

Two users asking the same question can receive different eligible results. A tenant-A principal
must never retrieve a tenant-B canary even when that canary is the closest semantic match. An
unauthenticated or unauthorized request returns before embeddings or completion are called.

## Failure cases

Missing metadata should fail closed; a role downgrade must affect the next request; deleted or
unpublished records must leave the eligible corpus; unsupported backend filters must be detected
during adapter qualification, not assumed equivalent.

## Security and ownership

Authentication and authorization are application responsibilities. Vector filters are an
enforcement layer, not an identity system. Prefer physical isolation for strong regulatory or
tenant boundaries, and independently authorize every tool called after retrieval.

## Production changes and tests

Centralize filter construction, use opaque tenant identifiers, log decisions without document
contents, and verify adapter semantics. Test cross-tenant canaries, each role pair, missing
metadata, stale sessions, filter injection, unpublished content, and pagination/threshold behavior.

## Runnable references

- [Filters and LSH](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/02-filters-and-lsh.ts)
- [Customer-support RAG application](/examples/applications/customer-support-rag)

## Extensions

Add per-document ACL expansion during ingestion, namespace routing, policy-decision caching with
short TTLs, and an evaluation suite that treats any forbidden result as a hard failure.
