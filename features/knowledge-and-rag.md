# Knowledge and RAG

Knowledge lets an agent answer from a large document collection without sending the whole collection to
the model. You index documents ahead of time, and Anvia retrieves only the relevant, permitted passages
for each request.

## When to use it

- Answers must come from documentation, policies, runbooks, or other content too large for every prompt.
- Most prompts need the same collection, so retrieval should run before each model turn.
- The model should decide when to search, or refine its query, across one or more collections.
- Answers depend on explicit relationships between entities, such as incidents affecting products.

Use static agent [context](/sdk/agents/context) for a small set of facts every run needs. Use an
application [tool](/sdk/tools) for live records, permission checks, and actions.

## How it works

Knowledge has two paths. Ingestion runs in a script, worker, or deployment job: source text is chunked,
embedded with an [embedding model](/sdk/models/embeddings), and upserted into a vector store. Runtime
retrieval searches that prepared index with the current prompt, applies `topK`, `minScore`, and a metadata
filter, and adds matching documents to the model request.

```ts
import { Agent, createVectorContext } from '@anvia/core'
import type { TextDocument } from '@anvia/core/documents'
import { InMemoryVectorStore, ingestVectorDocuments, vectorFilter } from '@anvia/core/vector-store'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })
const embeddingModel = client.embeddingModel({ modelId: 'text-embedding-3-small' })

const store = new InMemoryVectorStore<TextDocument>()
await ingestVectorDocuments({
  store,
  embeddingModel,
  documents: [{ id: 'support/reset-links', text: 'Password reset links expire after 30 minutes.', metadata: { published: true } }],
})

const agent = new Agent({
  id: 'docs-support',
  model,
  instructions: 'Answer from the documentation. Say when the answer is not available.',
  context: [createVectorContext({ store, model: embeddingModel, topK: 4, minScore: 0.72, filter: vectorFilter.eq('published', true) })],
})

const result = await agent.generate({ prompt: 'How long does a reset link last?' })
```

The in-memory store is for learning and tests. For production data, the same `VectorStore` interface is
implemented by adapter packages such as `@anvia/pgvector`, `@anvia/qdrant`, `@anvia/pinecone`,
`@anvia/weaviate`, `@anvia/milvus`, `@anvia/chroma`, `@anvia/lancedb`, and `@anvia/redis`.

Choose the retrieval pattern per agent:

- **Automatic retrieval:** `createVectorContext()` in the agent's `context` searches before every model turn.
- **Search tool:** `createVectorSearchTool()` lets the model choose when to search and with what query.
- **GraphRAG:** `@anvia/graph` extracts entities and relationships, then `createGraphSearchTool()` adds
  bounded graph traversal. `@anvia/neo4j` and `@anvia/memgraph` provide the database adapters.

## What your application owns

- **Retrieval permissions:** build tenant, visibility, and access filters on the server from authenticated
  request state. The model may choose the query and result count, never the access scope.
- **Index contents:** filtering does not remove sensitive text from an index. Do not embed secrets or
  unnecessary personal data.
- **Ingestion jobs:** run, schedule, and retry ingestion outside the request path, and re-embed when the
  embedding model or its dimensions change.
- **Storage and deployment:** provision, secure, back up, and retain the vector or graph database.
- **Source of truth:** a vector index or knowledge graph is a retrieval representation. Query live
  transactional data through application tools.

## Go deeper

- [Knowledges](/sdk/knowledges): ingestion and retrieval paths in one walkthrough
- [Load and chunk documents](/sdk/knowledges/load-documents): read sources and split them into chunks
- [Embeddings](/sdk/knowledges/embeddings): embed records, control concurrency, and design metadata
- [Vector stores](/sdk/knowledges/vector-stores): in-memory, persistent, and hybrid stores
- [Metadata filters](/sdk/knowledges/metadata-filters): restrict search by tenant, visibility, and scope
- [Automatic retrieval](/sdk/knowledges/automatic-retrieval): retrieve before every model turn
- [Search tools](/sdk/knowledges/search-tools): let the model decide when to search
- [Knowledge GraphRAG](/sdk/knowledges/graph-rag): graph ingestion and traversal with Neo4j or Memgraph
- [Package catalog](/packages/catalog): vector store and graph adapter packages
