# Collections and indexing

Automatic creation defines either an unnamed dense vector or named dense and sparse vectors. Production infrastructure should instead own collection creation, vector settings, replication, sharding, payload indexes, and snapshots.

```ts
const store = await QdrantVectorStore.connect({
  client,
  collectionName: 'support_docs_hybrid',
  vectorSize: 1536,
  hybrid: true,
  denseVectorName: 'dense',
  sparseVectorName: 'sparse',
  createIfMissing: false,
})
```

`vectorSize` and distance must match the dense model. Hybrid ingestion also validates that sparse embeddings align with dense embeddings. Metadata keys beginning with `__anvia_` are reserved.

Add payload indexes for fields used frequently in filters; the adapter does not create them.
