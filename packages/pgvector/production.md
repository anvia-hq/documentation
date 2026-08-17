# Production

- Manage the extension, table, and ANN index through migrations.
- Use `validate()` after schema deployment.
- Inject a pool configured for TLS, limits, timeouts, and shutdown.
- Match vector dimension, adapter distance, and index operator class.
- Inspect query plans after realistic data volume is loaded.
- Add indexes for high-frequency metadata filters and monitor table bloat.

The adapter's SQL upsert makes repeated physical IDs replace stored content and embeddings, but a changed chunking strategy can produce obsolete IDs. Include cleanup in corpus-version rollouts.

When the adapter creates its own pool, the store does not expose it for explicit shutdown; inject one in lifecycle-managed services.
