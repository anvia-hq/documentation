# Choose a vector-store adapter

**Level:** Pattern · **Estimated time:** 35 minutes

## Outcome

Move the same `embedDocuments` and `VectorSearchIndex` flow from local memory to a durable backend
without coupling agent code to a vendor SDK.

## When to use it

Use an adapter when embeddings must survive restarts, serve multiple workers, or exceed local
memory. Keep `InMemoryVectorStore` for deterministic tests and small demonstrations.

## Shared flow

application documents → `embedDocuments` → adapter `connect(...)` → `upsertDocuments(...)` →
`store.index(embeddingModel)` → `search(...)` or `.asTool(...)`.

## pgvector example

```ts
import { embedDocuments } from "@anvia/core/embeddings";
import { PgVectorStore } from "@anvia/pgvector";

const store = await PgVectorStore.connect<Note>({
  connectionString: process.env.DATABASE_URL!,
  tableName: "anvia_notes",
  vectorSize: 384,
});
await store.upsertDocuments(embedded);
const index = store.index(embeddingModel);
const results = await index.search({ query: "technology demand", topK: 5 });
```

`vectorSize` must match the embedding model. Provision tables, collections, indexes, namespaces,
and credentials using deployment automation rather than request handlers.

## Swap at the composition root

Keep your application dependent on the common search surface and select the adapter in one module.
Current packages cover Chroma, LanceDB, Milvus, pgvector, Pinecone, Qdrant, Redis, and Weaviate.
Connection options and filter support remain backend-specific, so swapping is not configuration-only
until your contract tests pass.

## Expected behavior

After an upsert, another process can search the same durable collection. Re-upserting a stable ID
replaces that document according to the adapter contract. Search returns common result objects with
score, ID, original document, and optional metadata.

## Failure cases

Dimension mismatch, missing indexes, connection loss, rate limits, partial batches, unsupported
filters, namespace mistakes, and consistency lag require explicit recovery. Do not automatically
create production resources from an untrusted request.

## Security and ownership

The application owns database credentials, network access, tenant routing, encryption, backups,
retention, and deletion. Use least-privileged service accounts and separate environments. Treat
metadata filters as one policy layer, not your only tenant boundary.

## Production changes and tests

Add health checks, timeouts, bounded batches, retry/idempotency policy, migrations, capacity alerts,
and backup/restore drills. Run the same adapter contract suite for upsert, search, thresholds,
filters, deletion, inspection, empty collections, and dimension errors.

## Runnable references

- [Chroma](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/06-chromadb-vector-store.ts)
- [Qdrant](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/07-qdrant-vector-store.ts)
- [pgvector](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/08-pgvector-store.ts)
- [Milvus](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/12-milvus-vector-store.ts)
- [Pinecone](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/13-pinecone-vector-store.ts)

## Extensions

Build a shadow-read migration, adapter latency dashboards, per-tenant namespaces, hybrid search,
and a corpus re-embedding plan with explicit model-version metadata.
