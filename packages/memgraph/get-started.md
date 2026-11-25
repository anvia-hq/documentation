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
  dimensions: 1536,
  similarity: 'cosine',
  text: true,
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

`name` and `dimensions` are enough for a managed graph: labels are derived from the name
(`SupportDocument`, `SupportChunk`, `SupportEntity`), the vector and text indexes use a `support_*`
prefix, and `similarity` defaults to `'cosine'`. `dotProduct` and `inner-product` both map to
Memgraph's inner-product metric, so use whichever name matches the embedding model's convention.
`text: true` (or `fulltext: true`) creates the chunk and entity text indexes; pass `{ chunks,
entities }` to name or narrow them. Pass an explicit `resources` object when the database names are
provisioned elsewhere.

Vector index `capacity` defaults to `100_000`, `resizeCoefficient` to `2`, and `scalarKind` to
`'f32'` when omitted. Configure dimensions to match the embedding model; retrieval checks them only
when the model declares `dimensions`, so a model that omits them still works against a graph whose
index dimensions are known.
