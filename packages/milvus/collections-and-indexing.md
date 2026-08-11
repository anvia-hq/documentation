# Collections and indexing

Automatic creation defines Anvia ID, logical document ID, serialized document, and float-vector fields. It creates HNSW with `M: 16`, `efConstruction: 256`, and the configured metric, then loads the collection.

Those values are a development baseline, not a universal production configuration. Provision collections and indexes through infrastructure when shard count, consistency, replicas, partitions, or build parameters matter, then use `createIfMissing: false`.

The configured `vectorSize` must match the embedding model and existing field dimension. Metadata names beginning with `__anvia_` are reserved.

Because ingestion calls `insert`, a repeated physical ID can fail or behave according to Milvus schema and server semantics. Make corpus replacement explicit rather than assuming the method name guarantees an update.
