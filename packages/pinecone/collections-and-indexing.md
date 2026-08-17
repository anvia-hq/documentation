# Indexes and namespaces

Use infrastructure automation to provision the index with its dimension, metric, cloud, region, and capacity mode. Then call `validate()` at startup.

`ensure()` first checks whether the index exists. If it is missing, the store requires an explicit `spec`, then creates the index with the configured `dimensions` and `metric` and waits for readiness. If the index already exists, or after creation, `validate()` checks the configured dimension and metric when Pinecone reports them.

The namespace defaults to the empty string. Use stable namespaces only when they match the corpus lifecycle and isolation model. Namespace changes point at different data; they do not migrate vectors.

Physical IDs are deterministic, so repeated ingestion updates matching records. Remove stale IDs when chunk counts or corpus versions change.
