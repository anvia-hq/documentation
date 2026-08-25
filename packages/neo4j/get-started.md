# Get started

Define the domain first. Node and relationship property schemas must use strict Zod objects so extraction, comparison, and stored properties stay exact.

```ts
import { Agent } from '@anvia/core/agent'
import {
  createGraphSearchTool,
  defineGraphSchema,
  ingestGraphText,
} from '@anvia/graph'
import { Neo4jClient } from '@anvia/neo4j'
import { z } from 'zod'

const schema = defineGraphSchema({
  nodes: {
    Product: {
      description: 'A product or service.',
      identity: ['id'],
      properties: z.strictObject({ id: z.string(), name: z.string() }),
    },
    Incident: {
      description: 'An operational incident.',
      identity: ['id'],
      properties: z.strictObject({ id: z.string(), title: z.string() }),
    },
  },
  relationships: {
    AFFECTS: {
      description: 'An incident affects a product.',
      from: 'Incident',
      to: 'Product',
      properties: z.strictObject({ severity: z.enum(['low', 'high']) }),
    },
  },
})

await using client = new Neo4jClient({
  uri: process.env.NEO4J_URI!,
  auth: {
    username: process.env.NEO4J_USERNAME!,
    password: process.env.NEO4J_PASSWORD!,
  },
})

const graph = client.managedKnowledgeGraph({
  name: 'support',
  schema,
  resources: {
    labels: { document: 'SupportDocument', chunk: 'SupportChunk', entity: 'SupportEntity' },
    indexes: {
      chunks: {
        vector: { name: 'support_chunks_vector', dimensions: 1536, similarity: 'cosine' },
        fulltext: { name: 'support_chunks_text' },
      },
      entities: {
        vector: { name: 'support_entities_vector', dimensions: 1536, similarity: 'cosine' },
        fulltext: { name: 'support_entities_text', properties: ['id', 'name', 'title'] },
      },
    },
  },
})

await graph.ensure({ indexTimeoutMs: 60_000 })
```

Ingest raw text with the shared graph helper. It chunks, extracts, embeds, and replaces the source
document in the managed graph:

```ts
await ingestGraphText({
  graph,
  document: { id: 'incident-42', text },
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

Use stable source IDs so re-ingestion replaces the complete previous representation.

```ts
const searchGraph = createGraphSearchTool({
  name: 'search_support_graph',
  description: 'Search connected incidents and products.',
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

const agent = new Agent({ id: 'support', model: chatModel, tools: [searchGraph] })
```

Continue with the [Knowledge GraphRAG guide](/sdk/knowledges/graph-rag) for ingestion, retrieval,
and provider switching.
