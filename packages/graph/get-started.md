# Get started

Define a portable schema with strict Zod property objects, register it with an adapter, then create a
graph-bound search tool.

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
    labels: {
      document: 'SupportDocument',
      chunk: 'SupportChunk',
      entity: 'SupportEntity',
    },
    indexes: {
      chunks: {
        vector: { name: 'support_chunks_vector', dimensions: 1536, similarity: 'cosine' },
      },
      entities: {
        vector: { name: 'support_entities_vector', dimensions: 1536, similarity: 'cosine' },
      },
    },
  },
})

await graph.ensure({ indexTimeoutMs: 60_000 })

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

const searchGraph = createGraphSearchTool({
  name: 'search_support_graph',
  description: 'Search connected incidents and products.',
  graph,
  model: embeddingModel,
  search: { type: 'vector', seeds: ['entities'], topK: 8 },
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

Switching to Memgraph changes the client and managed-resource configuration, not the schema,
ingestion helper, or Agent tool factory. See the [Memgraph guide](/packages/memgraph/get-started).
