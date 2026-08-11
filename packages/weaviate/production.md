# Production

- Inject a client configured for TLS, authentication, HTTP, gRPC, and shutdown.
- Pre-create collections with no vectorizer and use `createIfMissing: false`.
- Provision metadata properties and filter indexes explicitly.
- Keep embedding dimensions and collection distance stable.
- Test batch retry and repeated-UUID behavior before making ingestion resumable.
- Own backups, replication, aliases, and stale-object cleanup.

The adapter's default local client uses insecure connections and is not appropriate for a protected remote service. The store does not expose a client close method, so lifecycle-managed applications should inject and close the client themselves.

For common ingestion flow, see [Vector stores](/sdk/knowledges/vector-stores).
