# `@anvia/neo4j` API reference

## Schema and extraction

```ts
const schema = defineNeo4jGraphSchema({ nodes, relationships })
const facts = await extractGraphFacts({
  model,
  schema,
  chunks,
  instructions,
  retries,
  concurrency,
  abortSignal,
})
```

`defineNeo4jGraphSchema()` preserves literal node and relationship names in the inferred types. `extractGraphFacts()` returns `{ output, usage }`, where output contains entities, relationships, and chunk-to-entity mentions.

## Client and registrations

```ts
class Neo4jClient implements AsyncDisposable {
  constructor(options: Neo4jClientOptions)
  managedKnowledgeGraph(options): ManagedNeo4jKnowledgeGraph
  knowledgeGraph(options): Neo4jKnowledgeGraph
  nativeDriver(): Driver
  close(): Promise<void>
}
```

Managed registrations expose `ensure()`, `replaceDocuments()`, and `deleteDocuments()`. Existing registrations expose `validate()` and retrieval but no provisioning or mutation methods.

## Retrieval and tool

```ts
const context = await retrieveGraphContext({
  graph,
  model,
  query,
  search,
  traversal,
  evidence,
  retries,
  abortSignal,
})

const tool = createNeo4jGraphSearchTool({
  name,
  description,
  graph,
  model,
  search,
  traversal,
  evidence,
})
```

Search is discriminated as vector or hybrid. Traversal requires an explicit schema relationship allowlist and bounds. Evidence is always explicit as `{ type: 'none' }` or, for managed graphs, `{ type: 'chunks', maxChunks }`.

## Public type families

The package exports schema, entity, relationship, document, chunk, index, client, graph registration, extraction, write-result, retrieval, evidence, traversal, context, and graph-search tool types. `GraphFactConflictError` represents extraction conflicts that cannot be reconciled safely.
