# Sparse embeddings

Sparse models encode terms into parallel index/value arrays. Use them for lexical signals or combine them with dense semantic vectors.

## Index passages

```ts
const sparse = await loadFastEmbedSparseEmbeddingModel({ modelId: DEFAULT_FASTEMBED_SPARSE_EMBEDDING_MODEL })

const passages = await sparse.embedTexts([
  'Password reset links expire after thirty minutes.',
  'Enterprise accounts include priority support.',
])
```

`embedTexts()` calls FastEmbed’s passage encoder and returns `{ document, vector }` values.

## Encode a query

```ts
const query = await sparse.embedQuery('reset link expiration')
```

Query encoding uses FastEmbed’s distinct query path. Do not index documents with `embedQuery()` or search with a passage vector unless the model documentation explicitly calls for it.

## Hybrid retrieval

A typical hybrid collection stores:

- one named dense vector from the loaded dense embedding handle;
- one named sparse vector from the loaded sparse embedding handle;
- source text and metadata for filtering/citations.

The vector store owns fusion and ranking. The FastEmbed adapter only produces vectors. For Qdrant, configure a hybrid collection and an RRF search path through `@anvia/qdrant`.

## Validation and indexing

The adapter checks that sparse vectors contain numeric `indices` and `values` with matching lengths. It preserves provider order and values; it does not deduplicate, sort, or renormalize them.

Record the sparse model name with the collection. Changing the model requires re-embedding indexed passages and query configuration together.
