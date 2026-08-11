# Production

- Inject a client with explicit address, authentication, TLS, and timeouts.
- Provision collections and indexes before startup.
- Tune HNSW and search parameters for corpus scale and latency goals.
- Verify collection load and replica health during deployment.
- Define idempotent ingestion or replacement around Milvus `insert`.
- Monitor index build, compaction, storage, and multi-embedding growth.

The adapter creates a default local client when omitted and does not expose a close method. Applications that own shutdown should inject and release the client themselves.

Metadata filters are retrieval constraints, not tenant authorization. Keep access checks in the service layer.
