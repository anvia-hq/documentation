# Indexes and namespaces

Use infrastructure automation to provision the index with its dimension, metric, cloud, region, and capacity mode. Then connect with `createIfMissing: false`.

The adapter's automatic path attempts a serverless AWS `us-east-1` index and waits for readiness, but it does not receive a vector dimension in `PineconeVectorStoreConnectOptions`. Creation errors are treated as a possible already-existing index and may surface only when later operations run. This makes the path unsuitable as a production provisioning contract.

The namespace defaults to the empty string. Use stable namespaces only when they match the corpus lifecycle and isolation model. Namespace changes point at different data; they do not migrate vectors.

Physical IDs are deterministic, so repeated ingestion updates matching records. Remove stale IDs when chunk counts or corpus versions change.
