# Capabilities

- Dense near-vector search using precomputed embeddings.
- Weaviate v3 collections API integration.
- Batch object ingestion with deterministic UUIDs.
- Cosine, dot, or L2-squared distance configuration.
- Equality, comparison, `and`, and `or` filter translation.
- Multi-embedding logical result collapsing.
- `search` plus `createVectorSearchTool()` tool integration from `@anvia/core/vector-store`.

The adapter creates only baseline Anvia properties. It does not manage collection aliases, replication, tenancy, property indexing, backups, or data deletion. `close()` closes the adapter-created client; injected clients are left open.

Batch ingestion uses replacement semantics: `upsert()` deletes existing objects by `__anvia_document_id` before inserting, so re-upserting a document replaces its physical embeddings. See [API reference](/packages/weaviate/api-reference).
