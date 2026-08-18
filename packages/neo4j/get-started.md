# Get started

Define the domain first. Node and relationship property schemas must use strict Zod objects so extraction, comparison, and stored properties stay exact.

```ts
import { Agent } from '@anvia/core/agent'
import { embedDocuments } from '@anvia/core/embeddings'
import {
  Neo4jClient,
  createNeo4jGraphSearchTool,
  defineNeo4jGraphSchema,
  extractGraphFacts,
} from '@anvia/neo4j'
import { z } from 'zod'

const schema = defineNeo4jGraphSchema({
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

Extract facts from application-owned chunks, embed chunks and entities, and pass the normalized records to `replaceDocuments()`. Use stable document, chunk, entity, and relationship identities so re-ingestion produces meaningful change counts.

```ts
const searchGraph = createNeo4jGraphSearchTool({
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

Continue with the [GraphRAG guide](/sdk/knowledges/neo4j-graph-rag) for ingestion and replacement.
