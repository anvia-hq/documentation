# Capabilities

- Dense search over Milvus float-vector collections.
- Automatic baseline collection and HNSW creation for development.
- `search` alongside `ensure`, `validate`, and `upsert` from the core `VectorStore` contract; agent tool integration via core's `createVectorSearchTool()`.
- Multiple embeddings per document with logical-result collapsing.
- Scalar metadata stored alongside reserved Anvia fields.
- Translation of `eq`, `gt`, `lt`, `and`, and `or` filters.

`upsert()` deletes rows for each supplied document ID before inserting, so repeated ingestion replaces documents instead of duplicating them.

The adapter loads collections but does not manage partitions, replicas, aliases, compaction, or index rebuilds. See the [API reference](/packages/milvus/api-reference).
