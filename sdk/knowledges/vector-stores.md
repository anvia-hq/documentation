# Vector stores

A vector store persists embedded documents and searches raw vectors. `retrieveDocuments()` combines it with an embedding model for text queries; the same store/model pair also powers automatic retrieval and search tools.

## 1. Ingest raw text

```ts
import type { TextDocument } from '@anvia/core/documents'
import {
  InMemoryVectorStore,
  ingestVectorDocuments,
  retrieveDocuments,
} from '@anvia/core/vector-store'

const store = new InMemoryVectorStore<TextDocument>()

const { documents: embedded } = await ingestVectorDocuments({
  store,
  documents: [{
    id: 'support/reset-links',
    text,
    metadata: { product: 'accounts', published: true },
  }],
  embeddingModel,
  chunking: {
    strategy: 'recursive',
    maxSize: 1_600,
    overlap: 200,
    separators: ['\n\n', '\n', '. ', ' '],
  },
})
```

`ingestVectorText()` handles one document. `ingestVectorDocuments()` handles a batch. Without a
chunking option, each source document is embedded as one chunk. With chunking, embeddings remain
grouped under the source ID, so re-ingestion replaces the complete representation instead of
leaving stale chunks.

The in-memory store is process-local and is best for tests, examples, and small temporary indexes.
Its default brute-force strategy checks every stored document. Pass an LSH `index` strategy to the
constructor to narrow the candidate set before scoring once the index outgrows it:
`index: { type: 'lsh', numTables, numHyperplanes, seed? }`.

Stores may also implement `inspect()`, which pages stored documents with `limit` plus optional
`cursor` and `filter` — useful for debugging and rebuilds. The in-memory store and the Qdrant
adapter implement it.

## 2. Search the store

```ts
const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query: 'How long does a password reset link last?',
  topK: 3,
  minScore: 0.72,
})

for (const result of results) {
  console.log(result.score, result.id, result.document)
}
```

Results are ordered from highest to lowest score. Each result contains the stable ID, original document, score, and optional metadata.

`topK` limits the number of results. `minScore` removes matches below a minimum score. Tune both with real queries because score distributions vary by model and store.

## 3. Replace in-memory documents manually

```ts
import { embedDocuments } from '@anvia/core/embeddings'

const { documents: replacements } = await embedDocuments({
    model: embeddingModel,
    documents: changedDocuments,
    id: (document) => document.id,
    content: (document) => document.text
});
await store.upsert({
    documents: replacements
});
```

`upsert()` replaces an existing in-memory document with the same ID. Prefer the ingestion helper
when the input is raw text; it preserves document grouping across chunks automatically.

## 4. Use a persistent adapter

Production adapters provide clients that create stores implementing the same `VectorStore` interface:

```ts
import { QdrantVectorClient } from '@anvia/qdrant';
if (embeddingModel.dimensions === undefined) {
    throw new Error('The embedding model must declare its dimensions');
}
const storeClient = new QdrantVectorClient({});
const store = storeClient.vectorStore({
    collectionName: 'support_docs',
    dimensions: embeddingModel.dimensions
});
await store.ensure();
await store.upsert({
    documents: embedded
});
```

Changing the embedding model or dimensions requires a compatible collection and normally a complete re-embedding job.

## 5. Search with dense and sparse vectors

Hybrid retrieval adds a sparse lexical channel to dense similarity. A `HybridVectorStore` extends
the `VectorStore` interface with `searchHybrid()`, which ranks against both a dense query vector and
a `sparseVector` and fuses the two rankings. `fusion` selects `'rrf'` (reciprocal rank fusion, the
default) or `'dbsf'`. The [Qdrant](/packages/qdrant) adapter implements it; opt in with
`mode: 'hybrid'`:

```ts
import { QdrantVectorClient } from '@anvia/qdrant'

const qdrant = new QdrantVectorClient({})
const hybridStore = qdrant.vectorStore({
  collectionName: 'support_docs',
  dimensions: 1024,
  mode: 'hybrid',
})
```

Retrieve through `retrieveDocuments()` by passing `models: { dense, sparse }` instead of `model`;
the sparse model embeds the query with `embedSparseQuery()`:

```ts
const results = await retrieveDocuments({
  store: hybridStore,
  models: { dense: embeddingModel, sparse: sparseModel },
  fusion: 'rrf',
  query: 'How long does a password reset link last?',
  topK: 3,
})
```

Documents upserted into a hybrid store must carry `sparseEmbeddings` aligned 1:1 with `embeddings`;
the hybrid [`embedDocuments()`](/sdk/knowledges/embeddings) overload produces them. The same
`models`/`fusion` pair configures hybrid [search tools](/sdk/knowledges/search-tools) and
[automatic retrieval](/sdk/knowledges/automatic-retrieval).

Anvia provides adapters for [pgvector](/packages/pgvector), [Qdrant](/packages/qdrant), [Pinecone](/packages/pinecone), [Chroma](/packages/chroma), [LanceDB](/packages/lancedb), [Milvus](/packages/milvus), [Redis](/packages/redis), and [Weaviate](/packages/weaviate).

Keep credentials and ingestion jobs outside the agent. Pass only a prepared vector context or search tool into agent construction.

Next, constrain eligible documents with [metadata filters](/sdk/knowledges/metadata-filters).
