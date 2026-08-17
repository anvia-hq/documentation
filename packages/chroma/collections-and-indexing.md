# Collections and indexing

`connect()` calls Chroma's get-or-create path by default. New collections use `embeddingFunction: null` and cosine HNSW space unless custom metadata or configuration is supplied.

```ts
const storeClient = new ChromaVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs_v2',
    dimensions: embeddings.dimensions!
});
await store.validate();
```

Provision production collections before startup so distance, replication, authentication, and storage settings are reviewed. The adapter has no `vectorSize` option; Chroma and your ingestion workflow must reject dimension mismatches.

Each embedding becomes a physical record. Stable source IDs make repeated ingestion update the same generated record IDs. Changing chunk or embedding counts may leave older physical records unless the corpus replacement workflow removes them.
