# Production

- Inject an authenticated client, or pass `clientOptions`, with explicit endpoint and timeout settings.
- Pre-create dense or hybrid collections and call `validate()` at startup.
- Keep dense/sparse vector names stable across every workflow.
- Add payload indexes for common filters.
- Tune hybrid prefetch and fusion independently of final `topK`.
- Manage aliases, snapshots, replication, and collection replacement outside request handling.

The adapter supports clients with Qdrant's universal `query` API and retains dense compatibility with custom clients exposing legacy `search`. Test the actual client shape during upgrades.

Use stable logical document IDs. `upsertDocuments(...)` removes superseded physical points when
chunking changes. Prefer the official client or another `batchUpdate(...)`-capable client when
replacement must not have a delete-then-insert failure window.
