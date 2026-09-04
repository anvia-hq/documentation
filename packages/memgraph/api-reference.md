# `@anvia/memgraph` API reference

## Client

```ts
class MemgraphClient implements AsyncDisposable {
  constructor(options: MemgraphClientOptions)
  managedKnowledgeGraph(options): ManagedMemgraphKnowledgeGraph
  knowledgeGraph(options): MemgraphKnowledgeGraph
  nativeDriver(): Driver
  close(): Promise<void>
}
```

Managed registrations expose provisioning, retrieval, exploration, replacement, and deletion.
Existing registrations expose validation, retrieval, and exploration without mutation.

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
  maxNodes: 100,
  maxRelationships: 200,
})
```

`retrieveGraphContext()` accepts the same search, traversal, and evidence policy as
`graph.retrieve()`; chunk evidence requires a managed registration — the graph's
`evidenceCapability` must be `'chunks'` — while existing registrations use `{ type: 'none' }`.
`exploreGraph()` accepts the shared `overview` and `expand` options and returns nodes,
relationships, and truncation flags.

## Portable integration

Import `defineGraphSchema()`, `extractGraphFacts()`, `ingestGraphText()`,
`ingestGraphDocuments()`, `prepareGraphDocuments()`, and `createGraphSearchTool()` from
`@anvia/graph`. The adapter's graph registrations implement the corresponding provider-neutral
contracts, and `defineMemgraphGraphSchema()` re-exports `defineGraphSchema()` under a
Memgraph-specific name.

Memgraph resource options describe labels plus chunk and entity vector/text indexes. Existing-graph
seeds describe their node types and complete index definitions. Consult the published declarations
for exact option and result fields.
