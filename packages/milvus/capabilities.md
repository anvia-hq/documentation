# Capabilities

- Dense search over Milvus float-vector collections.
- Automatic baseline collection and HNSW creation for development.
- `search`, `searchIds`, and agent `asTool()` integration.
- Multiple embeddings per document with logical-result collapsing.
- Scalar metadata stored alongside reserved Anvia fields.
- Translation of `eq`, `gt`, `lt`, `and`, and `or` filters.

The ingestion method calls Milvus `insert` using deterministic physical IDs; it does not issue a provider upsert operation. Plan repeated-ingestion behavior against the configured primary-key policy.

The adapter loads collections but does not manage partitions, replicas, aliases, compaction, client shutdown, or index rebuilds. See the [API reference](/packages/milvus/api-reference).
