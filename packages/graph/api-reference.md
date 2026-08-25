# `@anvia/graph` API reference

## Schema and extraction

```ts
const schema = defineGraphSchema({ nodes, relationships })
const result = await extractGraphFacts({
  model,
  schema,
  chunks,
  instructions,
  retries,
  concurrency,
  abortSignal,
})
```

`extractGraphFacts()` returns `{ output, usage }`. The output contains typed entities,
relationships, and chunk-to-entity mentions.

## Ingestion

```ts
await ingestGraphText(options)
await ingestGraphDocuments(options)
await prepareGraphDocuments(options)
```

The ingestion helpers accept `TextDocument` records, shared `TextDocumentChunkingOptions`, models,
retry/concurrency settings, and cancellation. Write helpers additionally require a managed
`GraphDocumentWriter`, `conflict`, and `orphanEntities` policy.

## Retrieval and tools

```ts
await graph.retrieve({ model, query, search, traversal, evidence, retries, abortSignal })

const tool = createGraphSearchTool({
  name,
  description,
  graph,
  model,
  search,
  traversal,
  evidence,
  retries,
})
```

The public contracts include `GraphContextRetriever`, `GraphSearchOptions`,
`GraphTraversalOptions`, `GraphEvidenceOptions`, `GraphContext`, and `GraphSearchTool`.

## Exploration and writes

`GraphExplorer.explore()` accepts the `overview` and `expand` option unions and returns nodes,
relationships, and per-resource truncation flags. `GraphDocumentWriter.replaceDocuments()` accepts
prepared records and returns `GraphWriteResult` change counts.

The package also exports schema, fact, document, chunk, entity, relationship, mention, property,
preparation, exploration, and write-policy types. Use the published declarations as the exact field
reference.
