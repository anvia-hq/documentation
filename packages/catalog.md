# Package catalog

All packages below are maintained in the Anvia monorepo. “First-party” describes ownership, not API stability; consult each package's compatibility notes and changelog before upgrading.

## Core runtime

| Package | Purpose | Reference |
| --- | --- | --- |
| `@anvia/core` | Agent, model, tool, memory, pipeline, evaluation, and streaming primitives | [Open](/packages/core) |
| `@anvia/client` | Framework-neutral protocol v3, transports, UI messages, interactions, and stream state | [Open](/packages/client) |
| `@anvia/mcp` | MCP SDK v2 clients, transports, discovery, result mapping, and connection ownership | [Open](/packages/mcp) |
| `@anvia/server` | Server-side event stream and UI transport helpers | [Open](/packages/server) |
| `@anvia/react` | React state hooks over `@anvia/client` transports | [Open](/packages/react) |
| `@anvia/react-ui` | Strictly headless React chat and completion primitives | [Open](/packages/react-ui) |
| `@anvia/cli` | Editable shadcn/Tailwind application components built on React UI primitives | [Open](/packages/cli) |

## Model providers

| Package | Integration | Reference |
| --- | --- | --- |
| `@anvia/openai` | OpenAI and compatible APIs | [Open](/packages/openai) |
| `@anvia/anthropic` | Anthropic Claude | [Open](/packages/anthropic) |
| `@anvia/gemini` | Google Gemini | [Open](/packages/gemini) |
| `@anvia/mistral` | Mistral AI | [Open](/packages/mistral) |
| `@anvia/grok` | xAI Grok | [Open](/packages/grok) |

## Embeddings

| Package | Integration | Reference |
| --- | --- | --- |
| `@anvia/transformers` | Local Transformers.js embeddings | [Open](/packages/transformers) |

## Memory

| Package | Backend | Reference |
| --- | --- | --- |
| `@anvia/memory-sqlite` | SQLite | [Open](/packages/memory-sqlite) |
| `@anvia/memory-postgres` | PostgreSQL | [Open](/packages/memory-postgres) |
| `@anvia/memory-drizzle` | Drizzle ORM | [Open](/packages/memory-drizzle) |
| `@anvia/memory-prisma` | Prisma ORM | [Open](/packages/memory-prisma) |

## Vector stores

| Package | Backend | Reference |
| --- | --- | --- |
| `@anvia/chroma` | ChromaDB | [Open](/packages/chroma) |
| `@anvia/lancedb` | LanceDB | [Open](/packages/lancedb) |
| `@anvia/milvus` | Milvus | [Open](/packages/milvus) |
| `@anvia/pgvector` | PostgreSQL with pgvector | [Open](/packages/pgvector) |
| `@anvia/pinecone` | Pinecone | [Open](/packages/pinecone) |
| `@anvia/qdrant` | Qdrant | [Open](/packages/qdrant) |
| `@anvia/redis` | Redis vector search | [Open](/packages/redis) |
| `@anvia/weaviate` | Weaviate | [Open](/packages/weaviate) |

## Knowledge graphs

| Package | Backend | Reference |
| --- | --- | --- |
| `@anvia/graph` | Provider-neutral schemas, ingestion, retrieval tools, and exploration contracts | [Open](/packages/graph) |
| `@anvia/neo4j` | Neo4j 2026.01+ GraphRAG adapter | [Open](/packages/neo4j) |
| `@anvia/memgraph` | Memgraph 3.6+ GraphRAG adapter | [Open](/packages/memgraph) |

## Observability

| Package | Purpose | Reference |
| --- | --- | --- |
| `@anvia/logger` | Structured console and Pino logging | [Open](/packages/logger) |
| `@anvia/otel` | OpenTelemetry traces and evaluation logs | [Open](/packages/otel) |
| `@anvia/lens` | Native Lens tracing, evaluations, and datasets | [Open](/packages/lens) |
| `@anvia/langfuse` | Langfuse tracing, scoring, datasets, experiments, and prompts | [Open](/packages/langfuse) |

## Development tools

| Package | Purpose | Reference |
| --- | --- | --- |
| `@anvia/studio` | Local UI and HTTP runtime for agents and pipelines | [Open](/packages/studio) |
| `@anvia/sandbox` | Docker-backed workspaces and agent tools | [Open](/packages/sandbox) |
| `@anvia/browser` | Visible Docker Chromium and semantic browser tools | [Open](/packages/browser) |
