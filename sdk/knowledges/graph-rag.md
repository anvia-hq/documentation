# Knowledge GraphRAG

GraphRAG is useful when answers depend on explicit relationships—such as incidents affecting
products, people owning services, or controls governing resources—and bounded traversal adds
evidence that independent passage similarity cannot represent.

Anvia separates portable graph behavior from database adapters:

| Package | Responsibility |
| --- | --- |
| `@anvia/graph` | Schema, extraction, ingestion, retrieval contracts, Agent tools, exploration |
| `@anvia/neo4j` | Neo4j provisioning, persistence, search, traversal, exploration |
| `@anvia/memgraph` | Memgraph provisioning, persistence, search, traversal, exploration |

## Ingest source text

```ts
import { ingestGraphText } from '@anvia/graph'

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
```

The helper chunks text, extracts schema-valid facts, embeds chunks and entities, and replaces the
source document atomically in the managed graph. `ingestGraphDocuments()` handles batches.
`prepareGraphDocuments()` performs the model work without writing when an application needs custom
orchestration.

`result.vectorDocuments` reuses the chunk embeddings in Core-compatible vector-document groups:

```ts
await vectorStore.upsert({ documents: result.vectorDocuments })
```

The graph and vector writes remain separate transactions. Record ingestion state when both must be
reconciled.

## Give an Agent graph retrieval

```ts
import { createGraphSearchTool } from '@anvia/graph'

const searchGraph = createGraphSearchTool({
  name: 'search_graph',
  description: 'Search connected entities and supporting evidence.',
  graph,
  model: embeddingModel,
  search: {
    type: 'hybrid',
    seeds: ['chunks', 'entities'],
    topK: 8,
    candidatesPerSeed: 20,
    rrfK: 60,
  },
  traversal: {
    relationships: ['AFFECTS'],
    direction: 'both',
    maxDepth: 2,
    maxNodes: 40,
    maxRelationships: 80,
  },
  evidence: { type: 'chunks', maxChunks: 12 },
})
```

Managed graphs can hydrate stored chunks. Existing graph registrations are read-only and require
`evidence: { type: 'none' }`.

## Choose an adapter

Use [Neo4j](/packages/neo4j) for Neo4j 2026.01 or newer. Use
[Memgraph](/packages/memgraph) for Memgraph 3.6 or newer. Both implement the same retrieval and
exploration contracts, but provisioning and index options follow the database's native capabilities.

Use a vector store when independent passages are sufficient. Use application queries or tools for
live transactional data and authorization. A knowledge graph is a retrieval representation, not a
source-of-truth replacement.
