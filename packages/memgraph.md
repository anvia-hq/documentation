# `@anvia/memgraph`

`@anvia/memgraph` provides schema-first GraphRAG, managed ingestion, retrieval, and bounded graph
exploration for Memgraph 3.6 and newer. It implements the portable contracts from
[`@anvia/graph`](/packages/graph), so schemas, ingestion helpers, and Agent tools can be shared with
Neo4j deployments.

## Install

```sh
pnpm add @anvia/graph @anvia/memgraph @anvia/core zod
```

## Registration modes

- `managedKnowledgeGraph()` provisions and owns Anvia labels and indexes, supports raw-text
  ingestion, and can hydrate source-chunk evidence.
- `knowledgeGraph()` validates application-owned indexes and provides read-only retrieval and
  exploration with `{ type: 'none' }` evidence.

Managed graphs use Memgraph-native vector search, Tantivy text search, and bounded BFS traversal.
The application retains ownership of source discovery, credentials, retry policy, authorization,
and any application-native Cypher.

## Continue

- [Get started](/packages/memgraph/get-started)
- [Capabilities](/packages/memgraph/capabilities)
- [Production boundaries](/packages/memgraph/production)
- [API reference](/packages/memgraph/api-reference)
- [Knowledge GraphRAG guide](/sdk/knowledges/graph-rag)
