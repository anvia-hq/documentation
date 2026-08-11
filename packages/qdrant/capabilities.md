# Capabilities

| Mode | Input | Retrieval |
| --- | --- | --- |
| Dense | Dense embeddings | Qdrant universal query, with legacy search fallback for custom clients |
| Hybrid | Dense and sparse embeddings | Prefetched named-vector results fused with RRF or DBSF |

Both modes support deterministic upserts, metadata filters, multiple embeddings per logical document, `search`, `searchIds`, and `asTool()`.

Dense-only and hybrid collection/index modes cannot be mixed. Hybrid defaults to named vectors `dense` and `sparse`; configure matching names across creation, ingestion, and query.

The adapter does not manage aliases, snapshots, replicas, shards, payload indexes, or client lifecycle. See the [API reference](/packages/qdrant/api-reference).
