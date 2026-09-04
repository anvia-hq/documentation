# Capabilities

- Dense vectors stored beside JSONB document and metadata values.
- SQL upsert on deterministic physical IDs.
- Cosine, L2, and inner-product distance operators.
- Connection through a `pg` client, pool, or connection string.
- Parameterized equality and numeric comparison filters.
- `search` retrieval through the core `VectorStore` interface, with `retrieveDocuments` and `createVectorSearchTool` integration from `@anvia/core/vector-store`.
- Runtime validation of the vector column dimension.

The adapter can create the extension and base table, but it does not create HNSW or IVFFlat indexes. `PgVectorClient.close()` shuts down a pool the adapter created; injected clients remain caller-owned. The adapter does not manage database migrations, backups, RLS, or retries.

Metadata keys beginning with `__anvia_` are reserved. See the [API reference](/packages/pgvector/api-reference).
