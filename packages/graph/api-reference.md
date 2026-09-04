# `@anvia/graph` API reference

## Schema and extraction

```ts
const schema = defineGraphSchema({ nodes, relationships })
const result = await extractGraphFacts({
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

`extractGraphFacts()` returns `{ output, usage, warnings }`. The output contains typed entities,
relationships, and chunk-to-entity mentions; `warnings` reports fact conflicts that a `conflicts`
policy resolved instead of rejecting.

## Ingestion

```ts
await ingestGraphText(options)
await ingestGraphDocuments(options)
await ingestGraphTextToStores(options)
await ingestGraphDocumentsToStores(options)
await prepareGraphDocuments(options)
```

The ingestion helpers accept `TextDocument` records, shared `TextDocumentChunkingOptions`, models,
an optional `entityText` formatter for entity embeddings, retry/concurrency settings, cancellation,
an optional caller `revision`, and `factConflicts`. Write helpers additionally require a managed
`GraphDocumentWriter`, `conflict`, and `orphanEntities` policy.

`factConflicts` resolves disagreements between chunks before persistence with per-fact property
strategies: `reject` (the default, throwing `GraphFactConflictError`), `prefer-first`,
`prefer-last`, `prefer-defined`, `prefer-longest`, `union`, `max`, `min`, or a custom resolver.
Resolved disagreements are reported in `warnings`.

The ToStores helpers orchestrate the managed-graph write followed by a vector-store upsert: they
additionally require a `GraphVectorWriter` as `vectorStore` and accept `vectorProviderOptions`.
When the vector stage fails they throw `GraphIngestionStageError`, whose `receipt` — a
`GraphIngestionReceipt` with `documentIds`, `entityKeys`, `relationshipKeys`, `vectorDocumentIds`,
`graphWrite`, `vectorWrite`, `warnings`, and `revision` — records the completed graph stage for
retry.

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
