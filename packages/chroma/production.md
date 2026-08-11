# Production

- Inject an authenticated Chroma client configured for the intended server.
- Pre-provision the collection and use `createIfMissing: false`.
- Keep embedding model, dimensions, and collection distance stable.
- Monitor physical embeddings, not only logical source documents.
- Use stable IDs and define deletion or corpus-replacement behavior.
- Test metadata filters against the deployed Chroma version.

The default no-argument client is convenient locally but makes endpoint and credential ownership implicit. The store does not expose client shutdown or retry policy; own those through the injected client and application lifecycle.

Treat scores as backend-specific. Calibrate retrieval and reranking on representative data rather than sharing thresholds with another vector store.
