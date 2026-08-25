# Capabilities

| Surface | Managed graph | Existing graph |
| --- | --- | --- |
| Schema validation | Yes | Yes |
| Label and index provisioning | Yes | No |
| Raw-text ingestion | Yes | No |
| Document replacement and deletion | Yes | No |
| Vector retrieval | Yes | Yes |
| Hybrid vector/text retrieval | Yes | Yes, when registered |
| Bounded BFS traversal | Yes | Yes |
| Provenance-linked chunk evidence | Yes | No; use `type: 'none'` |
| Shared Agent graph-search tool | Yes | Yes |
| Bounded graph explorer | Yes | Yes |
| Caller-owned Cypher | Through `nativeDriver()` | Through `nativeDriver()` |

Managed graphs expose exact logical change counts for documents, chunks, entities, relationships,
and mentions. Explorer responses use opaque Memgraph IDs and omit embeddings and reserved
`__anvia_*` properties.
