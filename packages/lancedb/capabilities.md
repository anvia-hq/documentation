# Capabilities

- Embedded or application-managed LanceDB connections.
- Dense vector search with cosine, L2, or dot distance configuration.
- `search` through the common vector index; agent tool integration via `createVectorSearchTool()` from `@anvia/core/vector-store`.
- Multiple physical embeddings collapsed to one logical document result.
- All metadata serialized into a single `__anvia_metadata` JSON column.
- Post-retrieval filtering with `eq`, `gt`, `lt`, `and`, and `or` via core's `matchesVectorFilter`.

The adapter stores reserved columns for the row ID, document ID, serialized document, metadata, and vector. Metadata keys beginning with `__anvia_` are rejected.

It does not create ANN indexes, compact tables, or delete stale versions; those responsibilities remain with the application's LanceDB workflow. It does validate `dimensions`: `validate()` throws when the persisted `__anvia_vector` column's list size differs from the configured dimensions.
