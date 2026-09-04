# Collections and indexing

`ensure()` calls Chroma's get-or-create path by default. New collections use `embeddingFunction: null` and an HNSW configuration with cosine space unless a custom `configuration` is supplied; `metadata` does not change the distance space.

```ts
const storeClient = new ChromaVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs_v2',
    dimensions: 1536
});
await store.validate();
```

The adapter has no `vectorSize` option; it rejects document and query vectors whose length differs from `dimensions` during upsert and search.

Each embedding becomes a physical record keyed to the logical document ID. Re-ingesting a document ID deletes its existing records before writing new ones, so stable source IDs replace cleanly even when the chunk or embedding count changes.
