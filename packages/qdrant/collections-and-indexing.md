# Collections and indexing

Automatic creation defines either an unnamed dense vector or named dense and sparse vectors. Production infrastructure should instead own collection creation, vector settings, replication, sharding, payload indexes, and snapshots.

```ts
const storeClient = new QdrantVectorClient({
    client
});
const store = storeClient.vectorStore({
    collectionName: 'support_docs_hybrid',
    dimensions: 1536,
    mode: "hybrid",
    denseVectorName: 'dense',
    sparseVectorName: 'sparse'
});
await store.validate();
```

Dimensions, distance, and dense/hybrid shape must match the existing collection. `validate()`
checks these settings without creating infrastructure. Hybrid ingestion also
validates that sparse embeddings align with dense embeddings. Metadata keys beginning with
`__anvia_` are reserved.

## Replace and inspect logical documents

One logical document can produce several Qdrant points. `upsert({ documents })` removes all existing
points for each incoming document ID before inserting its current embeddings, preventing stale
points when chunking changes.

```ts
await store.upsert({
    documents: documents,
    providerOptions: {
        wait: true,
        ordering: 'strong',
        timeout: 30,
    }
});
await store.delete({ documentIds: ['obsolete-document'] });
const firstPage = await store.inspect({ limit: 50 });
const nextPage = firstPage.nextCursor
    ? await store.inspect({
        limit: 50,
        cursor: firstPage.nextCursor,
    })
    : undefined;
```

The official client performs replacement with `batchUpdate(...)`. A narrow custom client may fall
back to a sequential delete and upsert, which is not atomic if the upsert fails. Document retrieval
and inspection require `scroll(...)` on custom clients.

Add payload indexes for fields used frequently in filters; the adapter does not create them.
