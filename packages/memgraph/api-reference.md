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

## Portable integration

Import `defineGraphSchema()`, `extractGraphFacts()`, `ingestGraphText()`,
`ingestGraphDocuments()`, `prepareGraphDocuments()`, and `createGraphSearchTool()` from
`@anvia/graph`. The adapter's graph registrations implement the corresponding provider-neutral
contracts.

Memgraph resource options describe labels plus chunk and entity vector/text indexes. Existing-graph
seeds describe their node types and complete index definitions. Consult the published declarations
for exact option and result fields.
