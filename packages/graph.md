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

## Continue

- [Get started](/packages/graph/get-started)
- [Capabilities](/packages/graph/capabilities)
- [Ingestion and exploration](/packages/graph/ingestion-and-exploration)
- [API reference](/packages/graph/api-reference)
- [Knowledge GraphRAG guide](/sdk/knowledges/graph-rag)
