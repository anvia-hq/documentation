# Changelog

Every published Anvia package keeps its release history beside its implementation. Use these source changelogs for exact fixes, additions, breaking changes, and migration notes.

## Core runtime

- [`@anvia/core`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/core/CHANGELOG.md)
- [`@anvia/client`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/client/CHANGELOG.md)
- [`@anvia/server`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/server/CHANGELOG.md)
- [`@anvia/react`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/react/CHANGELOG.md)
- [`@anvia/react-ui`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/react-ui/CHANGELOG.md)

## Providers and embeddings

- [`@anvia/openai`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-openai/CHANGELOG.md)
- [`@anvia/anthropic`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-anthropic/CHANGELOG.md)
- [`@anvia/gemini`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-gemini/CHANGELOG.md)
- [`@anvia/mistral`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-mistral/CHANGELOG.md)
- [`@anvia/grok`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-grok/CHANGELOG.md)
- [`@anvia/fastembed`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/embedding-fastembed/CHANGELOG.md)
- [`@anvia/transformers`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/embedding-transformers/CHANGELOG.md)

## Memory and vector stores

- [`@anvia/memory-sqlite`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-sqlite/CHANGELOG.md)
- [`@anvia/memory-postgres`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-postgres/CHANGELOG.md)
- [`@anvia/memory-drizzle`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-drizzle/CHANGELOG.md)
- [`@anvia/memory-prisma`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-prisma/CHANGELOG.md)
- [`@anvia/chroma`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-chroma/CHANGELOG.md)
- [`@anvia/lancedb`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-lancedb/CHANGELOG.md)
- [`@anvia/milvus`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-milvus/CHANGELOG.md)
- [`@anvia/pgvector`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-pgvector/CHANGELOG.md)
- [`@anvia/pinecone`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-pinecone/CHANGELOG.md)
- [`@anvia/qdrant`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-qdrant/CHANGELOG.md)
- [`@anvia/redis`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-redis/CHANGELOG.md)
- [`@anvia/weaviate`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-weaviate/CHANGELOG.md)

## Observability and tools

- [`@anvia/logger`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/logger/CHANGELOG.md)
- [`@anvia/otel`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/observability-otel/CHANGELOG.md)
- [`@anvia/lens`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/observability-lens/CHANGELOG.md)
- [`@anvia/langfuse`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/observability-langfuse/CHANGELOG.md)
- [`@anvia/studio`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/tool-studio/CHANGELOG.md)
- [`@anvia/sandbox`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/tool-sandbox/CHANGELOG.md)

New RC3 packages do not have a generated package changelog until the synchronized release commit. Use their release pages and changesets:

- [`@anvia/browser`](/packages/browser/releases)
- [`@anvia/neo4j`](/packages/neo4j/releases)

## Upgrade workflow

Read the changelog for each directly installed Anvia package and any adapter whose peer dependency changes. Then follow the [upgrade checklist](/packages/compatibility-and-versioning#upgrade-checklist).
