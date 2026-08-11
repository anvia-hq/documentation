# Production

- Inject an authenticated client with explicit endpoint and timeout settings.
- Pre-create dense or hybrid collections and use `createIfMissing: false`.
- Keep dense/sparse vector names stable across every workflow.
- Add payload indexes for common filters.
- Tune hybrid prefetch and fusion independently of final `topK`.
- Manage aliases, snapshots, replication, and collection replacement outside request handling.

The adapter supports clients with Qdrant's universal `query` API and retains dense compatibility with custom clients exposing legacy `search`. Test the actual client shape during upgrades.

Use stable document IDs, and remove superseded physical IDs when chunking changes.
