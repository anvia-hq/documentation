# Keys and indexing

With automatic creation, `ensure()` checks `FT.INFO` and creates a HASH HNSW index when missing. The vector field is FLOAT32 with the configured dimension and distance. The default prefix is `anvia:<indexName>:`.

Production deployments should create the index through infrastructure and call `validate()`, which requires `FT.INFO` to succeed. Keep the index name, prefix, reserved field layout, dimension, and distance consistent with the adapter.

Each physical embedding is a Redis hash under a deterministic key. `upsert()` deletes existing hash keys for the document ids it upserts before writing, so re-ingesting a document with fewer embeddings leaves no stale chunk keys. No expiration is set, and cleanup of document ids your pipeline no longer produces remains the application's job. Use corpus-version prefixes or an explicit garbage-collection job when refreshing data.
