# Production

- Inject a client with explicit address, authentication, TLS, and timeouts.
- Provision collections and indexes before startup.
- Tune HNSW and search parameters for corpus scale and latency goals.
- Verify collection load and replica health during deployment.
- Define idempotent ingestion or replacement around Milvus `insert`.
- Monitor index build, compaction, storage, and multi-embedding growth.

The adapter creates a default local client when omitted. `close()` releases adapter-created clients, while injected clients remain open under the application's ownership.

Metadata filters are retrieval constraints, not tenant authorization. Keep access checks in the service layer.
