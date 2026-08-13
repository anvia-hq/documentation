# Vector stores

A vector store holds embedded documents and exposes a provider-neutral `VectorSearchIndex` to the agent runtime.

## Build a local index

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { InMemoryVectorStore } from '@anvia/core/vector-store'

const embedded = await embedDocuments(embeddingModel, documents, {
  id: (document) => document.id,
  content: (document) => document.text,
  metadata: (document) => ({
    source: document.source,
    product: document.product,
  }),
})

const localStore = InMemoryVectorStore.fromDocuments(embedded)
const index = localStore.index(embeddingModel)
```

The in-memory store is suitable for tests, demos, and small process-local indexes.

## Search the index

```ts
const results = await index.search({
  query: 'How long does a password reset link last?',
  topK: 3,
  threshold: 0.72,
})
```

Results are ordered by descending score and include the document ID, original document, and optional metadata. A threshold removes weak matches before they reach the model.

Use `searchIds(...)` when the index should identify likely records and the application must load their full contents through its own data-access layer.

## Update an in-memory store

```ts
const localStore = InMemoryVectorStore.fromDocuments(embedded)

const updatedDocuments = await embedDocuments(
  embeddingModel,
  changedDocuments,
  {
    id: (document) => document.id,
    content: (document) => document.text,
  },
)

localStore.addDocuments(updatedDocuments)
```

The in-memory store replaces an existing document with the same ID. Stable IDs make updates predictable and prevent old chunks from remaining searchable.

## Upsert production documents

Production adapters use the asynchronous, plural `upsertDocuments(...)` method:

```ts
import { QdrantVectorStore } from '@anvia/qdrant'

const documentsToUpsert = await embedDocuments(
  embeddingModel,
  changedDocuments,
  {
    id: (document) => document.id,
    content: (document) => document.text,
  },
)

const vectorStore = await QdrantVectorStore.connect({
  collectionName: 'support_docs',
  vectorSize: embeddingModel.dimensions,
})

await vectorStore.upsertDocuments(documentsToUpsert)
```

There is no singular `upsertDocument(...)` API. Pass one or several embedded documents as an array.

## Choose a production adapter

Anvia provides adapters for [pgvector](/packages/pgvector), [Qdrant](/packages/qdrant),
[Pinecone](/packages/pinecone), [Chroma](/packages/chroma), [LanceDB](/packages/lancedb),
[Milvus](/packages/milvus), [Redis](/packages/redis), and [Weaviate](/packages/weaviate).

Keep credentials, collection names, and ingestion jobs outside the agent. Pass a prepared `VectorSearchIndex` into the agent factory.
