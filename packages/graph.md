# `@anvia/graph`

`@anvia/graph` is the provider-neutral knowledge-graph layer for Anvia. It owns typed graph schemas,
fact extraction, raw-text ingestion, retrieval contracts, graph search tools, and bounded exploration.
Database connections, provisioning, persistence, and query execution stay in an adapter such as
[`@anvia/neo4j`](/packages/neo4j) or [`@anvia/memgraph`](/packages/memgraph).

## Install

```sh
pnpm add @anvia/graph @anvia/core zod
```

Install one graph adapter alongside it:

```sh
pnpm add @anvia/neo4j
# or
pnpm add @anvia/memgraph
```

## Portable workflow

```text
raw text → deterministic chunks → typed fact extraction
         → chunk/entity embeddings → managed graph write

query → vector or hybrid seeds → bounded traversal → optional source evidence
```

The same schema, ingestion helpers, retrieval options, result types, and Agent tool factory work
with either first-party adapter. Provider-specific configuration is limited to the client and graph
registration.

## Main entry points

| API | Purpose |
| --- | --- |
| `defineGraphSchema()` | Define typed nodes, relationships, identities, and strict property schemas. |
| `extractGraphFacts()` | Extract schema-valid entities, relationships, and source mentions. |
| `ingestGraphText()` | Chunk, extract, embed, and replace one raw-text source document. |
| `ingestGraphDocuments()` | Apply the same workflow to a batch of documents. |
| `ingestGraphTextToStores()` | Orchestrate the managed-graph write and the vector-store upsert for one document. |
| `ingestGraphDocumentsToStores()` | Orchestrate both writes for a batch of documents. |
| `GraphIngestionStageError` | Surface the completed graph-stage receipt when the vector write fails. |
| `prepareGraphDocuments()` | Prepare graph and reusable vector records without writing them. |
| `createGraphSearchTool()` | Expose any compatible graph retriever as an Agent tool. |
| `GraphExplorer` | Read bounded overviews and neighborhoods for visualization. |
| `resolveGraphExploreOptions()` | Validate and bound the shared explore options. |
| `@anvia/graph/explore` | Subpath export serving `resolveGraphExploreOptions()` and its resolved option types. |
| `createKnowledgeGraph()` | Bind a graph registration, embedding model, and extraction model into one handle with `ingest()`, `retrieve()`, `asTool()`, `asContext()`, and `explore()`. |
| `createGraphContext()` | Turn any graph retriever into a Core `ContextSource` for an agent's `context` array. |
| `formatGraphContext()` | Render a retrieval result as compact text with entities, relationships, and evidence sections. |
| `resolveGraphRetrieveOptions()` | Apply and validate the bounded search, traversal, and evidence defaults. |

## Schema strictness

`defineGraphSchema()` validates node `identity` fields and relationship `from`/`to` targets at
compile time, so a typo fails the type check rather than ingestion. `relationships` and relationship
`properties` are optional, and a plain `z.object()` is tightened to a strict object automatically:
every property schema must preserve its input value, so transforms and defaults are rejected.
`onInvalidFact` and the conflict policies then decide what happens to facts that arrive outside the
schema at runtime.

## Bind one handle

`createKnowledgeGraph()` takes the graph registration and turns the portable workflow into six
methods, so ingestion and retrieval options no longer have to be repeated at each call site:

```ts
import { createKnowledgeGraph } from '@anvia/graph'

const products = createKnowledgeGraph({
  graph: neo4jGraph,
  embeddingModel,
  extractionModel: openai.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' }),
  chunking: { strategy: 'recursive', maxSize: 1_000, overlap: 100 },
  onProgress: (event) => console.log(event.stage),
})

await products.ingest([{ id: 'catalog', text }])

const context = await products.retrieve('Which products depend on the billing service?')
const agent = new Agent({
  id: 'catalog-assistant',
  model,
  instructions: 'Answer from the graph and cite entities.',
  tools: [products.asTool({ name: 'search_catalog_graph' })],
  context: [products.asContext()],
})
```

Options set on the handle are defaults: per-call `ingest()` and `retrieve()` options win, and
`asTool()` and `asContext()` inherit the same `search`, `traversal`, `evidence`, and `retries`.

- `ingest()` requires an extraction model, from the handle or the call, and throws a `TypeError`
  when the graph registration is read-only. Pass `vectorStore` to also write reusable chunk and
  entity embeddings.
- `retrieve()` resolves bounded defaults: search `topK` `8`, hybrid `rrfK` `60`, traversal depth `2`
  with at most `40` nodes and `80` relationships, and evidence `maxChunks` `12`. The same constants
  are exported as `DEFAULT_GRAPH_SEARCH_TOP_K`, `DEFAULT_GRAPH_HYBRID_RRF_K`,
  `DEFAULT_GRAPH_TRAVERSAL_MAX_DEPTH`, `DEFAULT_GRAPH_TRAVERSAL_MAX_NODES`,
  `DEFAULT_GRAPH_TRAVERSAL_MAX_RELATIONSHIPS`, and `DEFAULT_GRAPH_EVIDENCE_MAX_CHUNKS`.
- `explore()` throws when the registration does not implement `GraphExplorer`.

`onProgress` receives `GraphIngestionProgressEvent` values: extraction reports
`{ stage: 'extract', completed, total, chunkId }`, and the later stages report `stage` (`'chunk'`,
`'embed-chunks'`, `'embed-entities'`, `'write-graph'`, `'write-vector'`) with a `count`.
`onInvalidFact: 'warn'` reports a `GraphInvalidFactWarning` for an extracted fact the schema rejects
instead of failing the document; the default policy throws.

## Add graph context to an agent

`createGraphContext()` returns a Core `ContextSource`, so a graph can feed every model turn without
writing a tool:

```ts
const graphContext = products.asContext({ evidence: { type: 'chunks', maxChunks: 6 } })

const agent = new Agent({
  id: 'catalog-assistant',
  model,
  instructions: 'Use the retrieved graph unless it is silent.',
  context: [graphContext],
})
```

By default the source renders `formatGraphContext()` output as one document with the id
`graph-context`, and returns no document when retrieval found nothing. Pass `format` to build your own
documents, and `id` to change that default document id. Because it is a `ContextSource`, the graph is
queried with the current turn's text; see
[automatic retrieval](/sdk/knowledges/automatic-retrieval#retrieve-context-yourself).

## Continue

- [Get started](/packages/graph/get-started)
- [Capabilities](/packages/graph/capabilities)
- [Ingestion and exploration](/packages/graph/ingestion-and-exploration)
- [API reference](/packages/graph/api-reference)
- [Knowledge GraphRAG guide](/sdk/knowledges/graph-rag)
