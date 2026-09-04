# Ingestion and exploration

## Ingest raw text

`ingestGraphText()` and `ingestGraphDocuments()` use the same `TextDocument` and chunking contracts
as Core vector ingestion. They chunk source text, extract facts, embed chunks and entities, and
atomically replace each source document in the managed graph.

```ts
const result = await ingestGraphText({
  graph,
  document: {
    id: 'incident-42',
    text,
    metadata: { tenant: 'acme' },
  },
  extractionModel,
  embeddingModel,
  chunking: {
    strategy: 'recursive',
    maxSize: 1_000,
    overlap: 100,
    separators: ['\n\n', '\n', ' '],
  },
  conflict: 'error',
  orphanEntities: 'delete',
})

console.log(result.write)
```

The result contains exact change counts (`write`), resolved extraction `warnings`, and
`vectorDocuments`, grouped by source document ID. Reuse those embeddings in a vector store without
another model request:

```ts
await vectorStore.upsert({ documents: result.vectorDocuments })
```

Every result also carries a `receipt: GraphIngestionReceipt` with `documentIds`, `entityKeys`,
`relationshipKeys`, `vectorDocumentIds`, the `graphWrite` change counts, the `vectorWrite` status,
`warnings`, and the optional caller-supplied `revision`.

Use `ingestGraphTextToStores()` or `ingestGraphDocumentsToStores()` to write the managed graph and
then upsert the chunk embeddings into a `GraphVectorWriter` in one call:

```ts
const result = await ingestGraphTextToStores({
  graph,
  vectorStore,
  document: {
    id: 'incident-42',
    text,
    metadata: { tenant: 'acme' },
  },
  extractionModel,
  embeddingModel,
})
```

The two writes still run in separate transactions. If the vector write fails, the helpers throw
`GraphIngestionStageError`, whose `receipt` marks the graph stage completed and the vector stage
failed so a queue can retry only the incomplete write; applications that require cross-store
reconciliation should persist their own ingestion status. Advanced callers can use
`prepareGraphDocuments()` to prepare both outputs without performing either write.

## Explore a graph

Any adapter implementing `GraphExplorer` supports a bounded overview and follow-up expansion:

```ts
const overview = await graph.explore({
  mode: 'overview',
  nodeTypes: ['Product'],
  includeProvenance: true,
  maxNodes: 100,
  maxRelationships: 200,
})

const neighborhood = await graph.explore({
  mode: 'expand',
  nodeIds: [overview.nodes[0]!.id],
  direction: 'both',
  maxDepth: 1,
})
```

Explorer IDs are opaque and provider-specific. Use them only to expand the current view; use schema
identity properties for application logic. The shared contract caps requests at 500 nodes, 1,000
relationships, depth 4, and 20 expansion roots. Adapter responses report truncation and omit stored
embeddings and reserved Anvia properties.

Pass `includeProvenance: true` to attach a `GraphExploreProvenance` with source `documentIds` and
`chunkIds` to nodes and relationships for source attribution. `@anvia/neo4j` implements
provenance.

Register the explorer in [Studio](/studio/graphs) for an interactive view.
