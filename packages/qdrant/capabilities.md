# Capabilities

| Mode | Input | Retrieval |
| --- | --- | --- |
| Dense | Dense embeddings | Qdrant universal query, with legacy search fallback for custom clients |
| Hybrid | Dense and sparse embeddings | Prefetched named-vector results fused with RRF or DBSF |

Both modes support deterministic document replacement, logical document deletion and retrieval,
paginated inspection, metadata filters, multiple embeddings per logical document, and `search`,
with `retrieveDocuments` and `createVectorSearchTool` integration from `@anvia/core/vector-store`.
Mutations accept Qdrant wait, ordering, and timeout controls.

Dense-only and hybrid collection/index modes cannot be mixed. Hybrid defaults to named vectors `dense` and `sparse`; configure matching names across creation, ingestion, and query.

Constructing a store performs no I/O; `ensure()` and `validate()` check existing collections against the
configured vector size, distance, and dense/hybrid shape. The adapter does not manage aliases, snapshots,
replicas, shards, payload indexes, or client lifecycle. See the [API reference](/packages/qdrant/api-reference).
