# Get started

Define the schema through `@anvia/graph`, then register Memgraph resources explicitly.

```ts
import {
  createGraphSearchTool,
  defineGraphSchema,
  ingestGraphText,
} from '@anvia/graph'
import { MemgraphClient } from '@anvia/memgraph'
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

await using client = new MemgraphClient({
  uri: process.env.MEMGRAPH_URI ?? 'bolt://localhost:7687',
  auth: process.env.MEMGRAPH_USERNAME
    ? {
        username: process.env.MEMGRAPH_USERNAME,
        password: process.env.MEMGRAPH_PASSWORD!,
      }
    : undefined,
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
        vector: {
          name: 'support_chunks_vector',
          dimensions: 1536,
          similarity: 'cosine',
          capacity: 100_000,
          scalarKind: 'f16',
        },
        text: { name: 'support_chunks_text' },
      },
      entities: {
        vector: {
          name: 'support_entities_vector',
          dimensions: 1536,
          similarity: 'cosine',
        },
      },
    },
  },
})

await graph.ensure()

await ingestGraphText({
  graph,
  document: { id: 'product-catalog', text },
  extractionModel,
  embeddingModel,
  conflict: 'error',
  orphanEntities: 'delete',
})

const searchGraph = createGraphSearchTool({
  name: 'search_support_graph',
  description: 'Search the support knowledge graph.',
  graph,
  model: embeddingModel,
  search: { type: 'vector', seeds: ['entities'], topK: 8 },
  traversal: {
    relationships: ['AFFECTS'],
    direction: 'both',
    maxDepth: 1,
    maxNodes: 40,
    maxRelationships: 80,
  },
  evidence: { type: 'chunks', maxChunks: 12 },
})
```

Vector index `capacity` defaults to `100_000`, `resizeCoefficient` to `2`, and `scalarKind` to
`'f32'` when omitted. Configure dimensions to match the embedding model.
