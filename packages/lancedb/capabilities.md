# Capabilities

- Embedded or application-managed LanceDB connections.
- Dense vector search with cosine, L2, or dot distance configuration.
- `search`, `searchIds`, and `asTool()` through the common vector index.
- Multiple physical embeddings collapsed to one logical document result.
- Scalar metadata preserved as table columns.
- `eq`, `gt`, `lt`, `and`, and `or` translated into Lance SQL expressions.

The adapter stores reserved columns for document ID, serialized document, and vector. Metadata keys beginning with `__anvia_` are rejected.

It does not create ANN indexes, compact tables, delete stale versions, or validate that `vectorSize` matches the persisted table. Those responsibilities remain with the application's LanceDB workflow.
