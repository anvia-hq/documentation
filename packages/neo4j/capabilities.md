# Capabilities

| Surface | Managed graph | Existing graph |
| --- | --- | --- |
| Schema validation | Yes | Yes |
| Constraint and index provisioning | Yes | No |
| Document replacement and deletion | Yes | No |
| Vector retrieval | Yes | Yes |
| Hybrid vector/full-text retrieval | Yes | Yes, when registered |
| Bounded relationship traversal | Yes | Yes |
| Provenance-linked chunk evidence | Yes | No; use `type: 'none'` |
| Agent graph-search tool | Yes | Yes |
| Caller-owned Cypher | Through `nativeDriver()` | Through `nativeDriver()` |

Document writes return exact logical before-and-after counts for documents, chunks, entities, relationships, and mentions. Replacing a document removes its previous chunks and provenance; facts still supported by other documents remain.

The public property boundary accepts JSON-safe Neo4j primitives and homogeneous primitive arrays. Neo4j integers outside the safe JavaScript range, temporal/spatial values, graph objects, maps, paths, and heterogeneous arrays are rejected instead of coerced.
