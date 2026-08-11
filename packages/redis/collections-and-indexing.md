# Keys and indexing

With automatic creation, `connect()` checks `FT.INFO` and creates a HASH HNSW index when missing. The vector field is FLOAT32 with the configured dimension and distance. The default prefix is `anvia:<indexName>:`.

Production deployments should create the index through infrastructure and use `createIfMissing: false`, which requires `FT.INFO` to succeed. Keep the index name, prefix, reserved field layout, dimension, and distance consistent with the adapter.

Each physical embedding is a Redis hash under a deterministic key. Writes replace fields for the same key, but no expiration is set and obsolete chunk keys are not removed. Use corpus-version prefixes or an explicit garbage-collection job when refreshing data.
