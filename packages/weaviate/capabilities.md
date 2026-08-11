# Capabilities

- Dense near-vector search using precomputed embeddings.
- Weaviate v3 collections API integration.
- Batch object ingestion with deterministic UUIDs.
- Cosine, dot, L2, Manhattan, or Hamming distance configuration.
- Equality, comparison, `and`, and `or` filter translation.
- Multi-embedding logical result collapsing.
- `search`, `searchIds`, and `asTool()` integration.

The adapter creates only baseline Anvia properties. It does not manage collection aliases, replication, tenancy, property indexing, backups, client shutdown, or data deletion.

Batch ingestion creates objects; confirm repeated-UUID behavior for your deployed Weaviate version instead of assuming a provider-level update. See [API reference](/packages/weaviate/api-reference).
