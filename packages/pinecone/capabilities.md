# Capabilities

- Dense vector upsert using deterministic physical IDs.
- Namespace-scoped ingestion and retrieval.
- Cosine, Euclidean, or dot-product metric configuration.
- Equality, range, `and`, and `or` metadata filters.
- Multiple embeddings collapsed into one logical document result.
- `search`, `searchIds`, and `asTool()` integration.

Metadata keys beginning with `__anvia_` are reserved for document reconstruction.

The adapter does not determine index dimension, capacity, deletion policy, or tenant authorization. Its automatic create path is a convenience and cannot express a production index's complete dimension and deployment policy; pre-provision instead. See the [API reference](/packages/pinecone/api-reference).
