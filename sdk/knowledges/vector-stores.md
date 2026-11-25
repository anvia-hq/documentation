# Vector stores

A vector store persists embedded documents and searches raw vectors. `retrieveDocuments()` combines it with an embedding model for text queries; the same store/model pair also powers automatic retrieval and search tools.

## 1. Create an index

`createVectorIndex()` binds a store, an embedding model, and retrieval defaults into one handle, so
ingestion and retrieval need no separate store plumbing:

```ts
import { createVectorIndex } from '@anvia/core/vector-store'

const docsIndex = createVectorIndex({
  model: embeddingModel,
  topK: 4,
  minScore: 0.74,
})

await docsIndex.ingest([
  { id: 'support/reset-links', text: resetLinksDoc, metadata: { product: 'accounts' } },
  'Billing invoices are available for 24 months.',
])

const results = await docsIndex.retrieve('How long do reset links last?')
```

Omitting `store` uses a process-local `InMemoryVectorStore`. Pass `{ store, model }` to attach a
persistent adapter or `{ store, models: { dense, sparse }, fusion? }` for a hybrid collection. The
handle exposes:

| Member | Purpose |
| --- | --- |
| `ensure()`, `validate()` | Prepare and check the underlying store |
| `ingest(input, options?)` | Embed one document or an array, with per-call `chunking`, `granularity`, `concurrency`, `retries`, and `abortSignal` |
| `delete(documentIds, options?)` | Remove documents by id |
| `retrieve(query, options?)` | Search with per-call `topK`, `minScore`, `filter`, `rerank`, `candidateTopK`, and `abortSignal` |
| `asTool({ name, description?, ...defaults })` | A search tool for an agent's `tools` array |
| `asContext(options?)` | A [vector context](/sdk/knowledges/automatic-retrieval) for an agent's `context` array |

Options set on `createVectorIndex()` are defaults: a per-call value wins, and ingestion settings
apply to every later `ingest()` call. Inputs can be plain strings or `{ id, text, metadata }`
objects. An input without an `id` derives a deterministic content-hash id, so pass explicit ids when
you plan to replace or delete the document later.

`granularity: 'chunk'` stores one record per chunk instead of one record per source document. Set it
on `createVectorIndex()` so `delete()` can resolve document ids to their stored chunk records through
`store.inspect()`; with `granularity: 'document'`, ids are deleted as-is. Deleting by document id on
a chunk-granularity index needs a store that implements `inspect()`, otherwise call `store.delete()`
with chunk record ids.

```ts
await docsIndex.delete('support/reset-links')
await docsIndex.delete(['support/reset-links', 'billing/invoices'])
```

Every bundled adapter client also implements `[Symbol.asyncDispose]()`, so
`await using client = new PgVectorClient(...)` releases its pool or connection when the scope ends.
The in-memory store needs no cleanup.

## 2. Ingest raw text

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

Scores use cosine similarity by default. Set `metric` to `'cosine'`, `'euclidean'`, or
`'dotProduct'`:

```ts
const store = new InMemoryVectorStore<TextDocument>({ metric: 'euclidean' })
```

Every metric keeps the higher-is-better contract. `cosine` returns cosine similarity, `dotProduct`
returns the raw inner product, and `euclidean` returns the negated Euclidean distance. A euclidean
score of `0` is an exact match, so `minScore` is a negative distance threshold: `minScore: -0.5`
keeps matches at distance `0.5` or less. With an `{ type: 'lsh' }` index, non-cosine metrics are
approximate because LSH buckets are angle-based; brute force, the default, is exact.

Stores may also implement `inspect()`, which pages stored documents with a positive safe-integer
`limit` plus optional `cursor` and `filter` — useful for debugging and rebuilds. The in-memory store
and the Qdrant adapter implement it. In-memory pages include `totalCount` and set `nextCursor` while
more rows remain. Pass that cursor back unchanged. An in-memory cursor is a canonical non-negative
safe-integer decimal offset: signs, fractions, exponents, whitespace, leading zeroes, and values
outside the safe-integer range throw a `VectorInspectCursorError` instead of silently replaying a
page. An omitted cursor starts at `0`.

`VectorInspectCursorError` extends `RangeError`. Use `VectorInspectCursorError.isCursorError(error)`
to identify an invalid cursor without matching its message; `parseVectorInspectCursor()` exposes the
same parser. Qdrant uses its own opaque cursor format, so treat every adapter's cursor as an opaque
value rather than parsing or constructing it.

The in-memory store accepts only a canonical nonnegative safe integer string as `cursor`. Signs, fractions, exponents, whitespace, and leading zeroes are rejected. Invalid cursors throw a `RangeError` subclass. Check for them with `VectorInspectCursorError.isCursorError(error)`, which is exported from `@anvia/core/vector-store`. Pass each returned `nextCursor` back unchanged.

## 3. Search the store

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

`topK` limits the number of results and defaults to `5` when omitted. `minScore` removes matches below a minimum score. Tune both with real queries because score distributions vary by model and store. `matchedText` on a result carries the stored text that scored highest when the adapter can supply it.

## 4. Replace in-memory documents manually

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

## 5. Use a persistent adapter

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

## 6. Rerank candidates

`retrieveDocuments()` and `createVectorIndex().retrieve()` accept a `rerank` function that reorders
the candidates after the store search:

```ts
const results = await docsIndex.retrieve('refund policy for annual plans', {
  topK: 5,
  candidateTopK: 25,
  rerank: async ({ query, results }) => rankWithCrossEncoder(query, results),
})
```

The reranker receives `{ query, results, abortSignal }` and returns results in the order the
application wants. `candidateTopK` sets how many store matches are fetched before reranking and
defaults to three times `topK`; the final list is still cut to `topK`. A reranker may change scores
or drop results, so treat its scores as application-defined rather than comparable to store
similarity. Retrieval, search tools, and vector contexts all accept the same pair.

## 7. Search with dense and sparse vectors

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
