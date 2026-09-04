# `@anvia/neo4j`

`@anvia/neo4j` adds schema-first GraphRAG for Neo4j 2026.01 and newer. It implements the
provider-neutral contracts in [`@anvia/graph`](/packages/graph) for managed raw-text ingestion,
vector or hybrid retrieval, bounded traversal, provenance evidence, Agent tools, and graph
exploration.

## Install

```bash
pnpm add @anvia/graph @anvia/neo4j @anvia/core zod
```

## Two registration modes

- A managed knowledge graph provisions Anvia labels, constraints, vector indexes, and optional full-text indexes. It supports document replacement and deletion.
- An existing knowledge graph validates caller-owned indexes and exposes read-only retrieval. Application code keeps provisioning and writes.

Both modes require an explicit graph schema and explicit retrieval, traversal, and evidence policy.
Use `defineGraphSchema()` for portable applications. `defineNeo4jGraphSchema()` remains available as
a compatibility API.

## Tenant namespaces

`client.tenant(tenantId)` returns a `Neo4jTenant` handle scoped to the deterministic sha256
namespace of the tenant ID. Its `managedKnowledgeGraph()` provisions the same labels, constraints,
and indexes as a client-level registration, and stamps a `__anvia_namespace` property on every
node and relationship so vector search, full-text search, traversal, evidence, and exploration only
ever see that tenant's rows. Tenant IDs are hashed before they reach a resource name, so shared
deployments never construct names from user input.

## Core flow

```text
raw text -> ingestGraphText() or ingestGraphDocuments()
         -> chunk, extract facts, embed chunks/entities
         -> replace documents in one managed-graph transaction

query -> embed -> vector or hybrid seeds -> bounded traversal -> evidence
```

The convenience helpers perform model preparation before starting the database write. Advanced
applications can call `prepareGraphDocuments()` and `replaceDocuments()` separately.

## Next steps

- [Get started](/packages/neo4j/get-started)
- [Capabilities](/packages/neo4j/capabilities)
- [Production boundaries](/packages/neo4j/production)
- [Public API](/packages/neo4j/api-reference)
- [Knowledge GraphRAG guide](/sdk/knowledges/graph-rag)
- [Explore graphs in Studio](/studio/graphs)
