# `@anvia/neo4j` API reference

## Schema and extraction

```ts
const schema = defineGraphSchema({ nodes, relationships })
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

Import the provider-neutral `defineGraphSchema()` and `extractGraphFacts()` from `@anvia/graph`.
`defineNeo4jGraphSchema()` and the adapter extraction export remain available for compatibility.
Extraction returns `{ output, usage }`, where output contains entities, relationships, and
chunk-to-entity mentions.

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

Managed registrations expose `ensure()`, `replaceDocuments()`, `deleteDocuments()`, `retrieve()`,
and `explore()`. Existing registrations expose `validate()`, `retrieve()`, and `explore()` but no
provisioning or mutation methods.

## Retrieval and tool

```ts
const context = await graph.retrieve({
  model,
  query,
  search,
  traversal,
  evidence,
  retries,
  abortSignal,
})

const tool = createGraphSearchTool({
  name,
  description,
  graph,
  model,
  search,
  traversal,
  evidence,
})
```

Import `createGraphSearchTool()` from `@anvia/graph`. Search is discriminated as vector or hybrid.
Traversal requires an explicit schema relationship allowlist and bounds. Evidence is always
explicit as `{ type: 'none' }` or, for managed graphs, `{ type: 'chunks', maxChunks }`.

## Ingestion and exploration

Use `ingestGraphText()`, `ingestGraphDocuments()`, and `prepareGraphDocuments()` from
`@anvia/graph`. Both graph registration modes implement `GraphExplorer`:

```ts
await graph.explore({ mode: 'overview', maxNodes: 100 })
await graph.explore({ mode: 'expand', nodeIds, maxDepth: 1 })
```

## Public type families

Provider-neutral schema, fact, ingestion, retrieval, tool, exploration, and write contracts live in
`@anvia/graph`. `@anvia/neo4j` exports Neo4j client, resource, registration, index, and compatibility
types. `GraphFactConflictError` represents extraction conflicts that cannot be reconciled safely.
