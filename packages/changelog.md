# Changelog

Every published Anvia package keeps its release history beside its implementation. Use these source changelogs for exact fixes, additions, breaking changes, and migration notes.

## Core runtime

- [`@anvia/core`](https://github.com/anvia-hq/anvia/blob/main/packages/core/CHANGELOG.md)
- [`@anvia/client`](https://github.com/anvia-hq/anvia/blob/main/packages/client/CHANGELOG.md)
- [`@anvia/mcp`](/packages/mcp/releases)
- [`@anvia/server`](https://github.com/anvia-hq/anvia/blob/main/packages/server/CHANGELOG.md)
- [`@anvia/react`](https://github.com/anvia-hq/anvia/blob/main/packages/react/CHANGELOG.md)
- [`@anvia/react-ui`](https://github.com/anvia-hq/anvia/blob/main/packages/react-ui/CHANGELOG.md)
- [`@anvia/cli`](/packages/cli/releases)

## Providers and embeddings

- [`@anvia/openai`](https://github.com/anvia-hq/anvia/blob/main/packages/provider-openai/CHANGELOG.md)
- [`@anvia/anthropic`](https://github.com/anvia-hq/anvia/blob/main/packages/provider-anthropic/CHANGELOG.md)
- [`@anvia/gemini`](https://github.com/anvia-hq/anvia/blob/main/packages/provider-gemini/CHANGELOG.md)
- [`@anvia/mistral`](https://github.com/anvia-hq/anvia/blob/main/packages/provider-mistral/CHANGELOG.md)
- [`@anvia/grok`](https://github.com/anvia-hq/anvia/blob/main/packages/provider-grok/CHANGELOG.md)
- [`@anvia/transformers`](https://github.com/anvia-hq/anvia/blob/main/packages/embedding-transformers/CHANGELOG.md)

## Memory, vector stores, and knowledge graphs

- [`@anvia/memory-sqlite`](https://github.com/anvia-hq/anvia/blob/main/packages/memory-sqlite/CHANGELOG.md)
- [`@anvia/memory-postgres`](https://github.com/anvia-hq/anvia/blob/main/packages/memory-postgres/CHANGELOG.md)
- [`@anvia/memory-drizzle`](https://github.com/anvia-hq/anvia/blob/main/packages/memory-drizzle/CHANGELOG.md)
- [`@anvia/memory-prisma`](https://github.com/anvia-hq/anvia/blob/main/packages/memory-prisma/CHANGELOG.md)
- [`@anvia/chroma`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-chroma/CHANGELOG.md)
- [`@anvia/lancedb`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-lancedb/CHANGELOG.md)
- [`@anvia/milvus`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-milvus/CHANGELOG.md)
- [`@anvia/pgvector`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-pgvector/CHANGELOG.md)
- [`@anvia/pinecone`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-pinecone/CHANGELOG.md)
- [`@anvia/qdrant`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-qdrant/CHANGELOG.md)
- [`@anvia/redis`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-redis/CHANGELOG.md)
- [`@anvia/weaviate`](https://github.com/anvia-hq/anvia/blob/main/packages/vector-weaviate/CHANGELOG.md)
- [`@anvia/graph`](/packages/graph/releases)
- [`@anvia/neo4j`](/packages/neo4j/releases)
- [`@anvia/memgraph`](/packages/memgraph/releases)

## Observability and tools

- [`@anvia/logger`](https://github.com/anvia-hq/anvia/blob/main/packages/logger/CHANGELOG.md)
- [`@anvia/otel`](https://github.com/anvia-hq/anvia/blob/main/packages/observability-otel/CHANGELOG.md)
- [`@anvia/lens`](https://github.com/anvia-hq/anvia/blob/main/packages/observability-lens/CHANGELOG.md)
- [`@anvia/langfuse`](https://github.com/anvia-hq/anvia/blob/main/packages/observability-langfuse/CHANGELOG.md)
- [`@anvia/studio`](https://github.com/anvia-hq/anvia/blob/main/packages/tool-studio/CHANGELOG.md)
- [`@anvia/sandbox`](https://github.com/anvia-hq/anvia/blob/main/packages/tool-sandbox/CHANGELOG.md)
- [`@anvia/browser`](https://github.com/anvia-hq/anvia/blob/main/packages/tool-browser/CHANGELOG.md)

Packages release independently. Read the changelog for each package you install; a dependency-only
patch can advance an adapter even when its own public behavior did not change.

## Upgrade workflow

Read the changelog for each directly installed Anvia package and any adapter whose dependency or
peer-dependency range changes. Then follow the
[upgrade checklist](/packages/compatibility-and-versioning#upgrade-checklist).
