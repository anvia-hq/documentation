# `@anvia/neo4j` API reference

## Schema and extraction

```ts
const schema = defineGraphSchema({ nodes, relationships })
const facts = await extractGraphFacts({
  model,
  schema,
  chunks,
  conflicts,
  instructions,
  retries,
  concurrency,
  abortSignal,
})
```

Import the provider-neutral `defineGraphSchema()` and `extractGraphFacts()` from `@anvia/graph`.
`defineNeo4jGraphSchema()` and the adapter extraction export remain available for compatibility.
Extraction returns `{ output, usage, warnings }`, where output contains entities, relationships,
and chunk-to-entity mentions; `warnings` reports fact conflicts that a `conflicts` policy resolved
instead of rejecting.

## Client and registrations

```ts
class Neo4jClient implements AsyncDisposable {
  constructor(options: Neo4jClientOptions)
  managedKnowledgeGraph(options): ManagedNeo4jKnowledgeGraph
  tenant(tenantId): Neo4jTenant
  knowledgeGraph(options): Neo4jKnowledgeGraph
  nativeDriver(): Driver
  close(): Promise<void>
}

class Neo4jTenant {
  get namespace(): string
  managedKnowledgeGraph(options): ManagedNeo4jKnowledgeGraph
}
```

Managed registrations expose `ensure()`, `replaceDocuments()`, `deleteDocuments()`, `retrieve()`,
and `explore()`. Existing registrations expose `validate()`, `retrieve()`, and `explore()` but no
provisioning or mutation methods.

`tenant()` hashes the tenant ID into a sha256 namespace, and namespaces are created only through
`tenant()`. A `Neo4jTenant.managedKnowledgeGraph()` provisions a tenant-scoped managed graph whose
writes, vector and full-text search, traversal, evidence, and exploration are stamped and filtered
by the `__anvia_namespace` property.

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

## Standalone retrieval and exploration

`retrieveGraphContext()` and `exploreGraph()` run the same policies without going through a
registration method:

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

const view = await exploreGraph(graph, {
  mode: 'overview',
  includeProvenance: true,
  maxNodes: 100,
  maxRelationships: 200,
})
```

`retrieveGraphContext()` accepts the same search, traversal, and evidence policy as
`graph.retrieve()`; evidence is `{ type: 'none' }` for existing registrations and
`{ type: 'chunks', maxChunks }` for managed ones. `exploreGraph()` accepts the shared `overview`
and `expand` options and returns nodes, relationships, and truncation flags; pass
`includeProvenance: true` to attach `GraphExploreProvenance` source `documentIds` and `chunkIds`
to nodes and relationships.

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
