# `@anvia/neo4j`

`@anvia/neo4j` adds schema-first GraphRAG for Neo4j 2026.01 and newer. It can extract typed entities and relationships, own a managed document graph, retrieve vector or hybrid seeds, traverse bounded relationships, hydrate provenance-linked chunks, and expose graph search as an Agent tool.

## Install

```bash
pnpm add @anvia/neo4j@rc @anvia/core@rc zod
```

## Two registration modes

- A managed knowledge graph provisions Anvia labels, constraints, vector indexes, and optional full-text indexes. It supports document replacement and deletion.
- An existing knowledge graph validates caller-owned indexes and exposes read-only retrieval. Application code keeps provisioning and writes.

Both modes require an explicit graph schema and explicit retrieval, traversal, and evidence policy.

## Core flow

```text
documents -> chunks -> extractGraphFacts()
                  -> embed chunks and entities
                  -> replaceDocuments()

query -> embed -> vector or hybrid seeds -> bounded traversal -> evidence
```

Model extraction and database writes are intentionally separate. `extractGraphFacts()` performs model calls but no writes; `replaceDocuments()` performs one deterministic transaction but no model calls.

## Next steps

- [Get started](/packages/neo4j/get-started)
- [Capabilities](/packages/neo4j/capabilities)
- [Production boundaries](/packages/neo4j/production)
- [Public API](/packages/neo4j/api-reference)
- [GraphRAG guide](/sdk/knowledges/neo4j-graph-rag)
