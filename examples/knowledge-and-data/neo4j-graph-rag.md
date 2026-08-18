# Neo4j GraphRAG

Build a typed incident graph when users need to ask both semantic and relationship questions, such as which incidents affect a product and what source chunks support that connection.

## Pattern

- Define strict `Product` and `Incident` nodes plus an `AFFECTS` relationship.
- Chunk incident documents with stable document and chunk IDs.
- Extract graph facts with a completion model.
- Embed chunks and canonical entity descriptions with the same vector dimensions as the graph indexes.
- Replace affected documents transactionally.
- Give the agent a bounded hybrid graph-search tool with chunk evidence.

```ts
const searchGraph = createNeo4jGraphSearchTool({
  name: 'search_incident_graph',
  description: 'Search incidents, affected products, and supporting evidence.',
  graph,
  model: embeddingModel,
  search: {
    type: 'hybrid',
    seeds: ['chunks', 'entities'],
    topK: 6,
    candidatesPerSeed: 12,
    rrfK: 60,
  },
  traversal: {
    relationships: ['AFFECTS'],
    direction: 'both',
    maxDepth: 2,
    maxNodes: 24,
    maxRelationships: 36,
  },
  evidence: { type: 'chunks', maxChunks: 8 },
})
```

Ask which incidents affect a known product, then ask for the supporting source text. Validate the returned entity and relationship identities plus eligible evidence IDs instead of asserting exact model prose.

Failure cases include index-dimension mismatches, extraction schema violations, conflicting entity properties, unknown provenance chunk IDs, unavailable full-text indexes, and traversal limits that are too small for the required path.

See the runnable [RC3 cookbook source](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/14-neo4j-graph-rag.ts).
