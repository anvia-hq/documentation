# Capabilities

- Hash-backed dense vector storage.
- RediSearch HNSW indexes with FLOAT32 vectors.
- Cosine, L2, and inner-product distance configuration.
- Deterministic hash keys for repeatable writes.
- Equality, numeric range, `and`, and `or` filter translation.
- `search` plus `createVectorSearchTool()` tool integration from `@anvia/core/vector-store`.
- Logical result collapsing for multi-embedding documents.

The adapter writes no TTL and provides no delete or corpus-cleanup API. It does not configure Redis persistence, eviction, clustering, or authentication. `close()` quits the adapter-created client; injected clients are left open. Metadata keys beginning with `__anvia_` are reserved.

See the [API reference](/packages/redis/api-reference).
