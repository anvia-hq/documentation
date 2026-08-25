# Neo4j GraphRAG migration notes

The portable GraphRAG APIs now live in `@anvia/graph`. For new code, follow
[Knowledge GraphRAG](/sdk/knowledges/graph-rag). Existing Neo4j applications should make these
changes when upgrading to `@anvia/neo4j` 1.0.3 or newer:

- install `@anvia/graph` explicitly;
- import `defineGraphSchema()`, `extractGraphFacts()`, ingestion helpers, and
  `createGraphSearchTool()` from `@anvia/graph`;
- replace the removed `createNeo4jGraphSearchTool()` with `createGraphSearchTool()`;
- call `graph.retrieve()` for the provider-neutral retrieval contract;
- optionally replace manual preparation with `ingestGraphText()` or `ingestGraphDocuments()`.

GraphRAG is useful when answers depend on explicit relationships—such as incidents affecting products, people owning services, or controls governing resources—and bounded traversal adds information that flat similarity search would miss.

## Keep four phases separate

1. Application code discovers, reads, and chunks source documents.
2. `extractGraphFacts()` asks a completion model for schema-valid entities, relationships, and mentions.
3. Application code embeds source chunks and canonical entity text.
4. A managed graph replaces the affected documents in one deterministic transaction.

This separation makes model retries independent from database writes and keeps the application's ingestion policy visible.

## Replace by document

```ts
const facts = await extractGraphFacts({
  model: extractionModel,
  schema,
  chunks,
  retries: { maxAttempts: 2 },
  concurrency: 4,
})

const [embeddedChunks, embeddedEntities] = await Promise.all([
  embedDocuments({
    model: embeddingModel,
    documents: chunks,
    id: (chunk) => chunk.id,
    content: (chunk) => chunk.text,
  }),
  embedDocuments({
    model: embeddingModel,
    documents: [...facts.output.entities],
    id: (entity) => entity.key,
    content: (entity) => formatEntityForEmbedding(entity),
  }),
])

const changes = await graph.replaceDocuments({
  documents,
  chunks: embeddedChunks.documents,
  entities: embeddedEntities.documents,
  relationships: facts.output.relationships,
  mentions: facts.output.mentions,
  conflict: 'error',
  orphanEntities: 'delete',
})
```

Stable identities determine whether logical resources are created, updated, deleted, or unchanged. Replacing one document removes its previous chunks and provenance, while facts supported by other documents remain.

## Retrieve with explicit limits

Vector search ranks one or more seed indexes directly. Hybrid search combines vector and full-text candidate lists with reciprocal-rank fusion. Traversal begins from those seeds and follows only the declared relationship types, direction, and limits.

Choose `{ type: 'chunks', maxChunks }` evidence only for a managed graph. Existing graph registrations do not own Anvia chunk provenance and therefore require `{ type: 'none' }`.

## When not to use it

Use a vector store when independent passages are sufficient and relationships do not materially improve retrieval. Use application queries or tools for live transactional data and authorization. GraphRAG is a retrieval representation, not a source-of-truth replacement.

The manual extraction/embedding/write composition below remains valid for advanced orchestration.
Continue with the [`@anvia/neo4j` package guide](/packages/neo4j) and
[`@anvia/graph` ingestion](/packages/graph/ingestion-and-exploration).
