# Production boundaries

## Provision explicit resources

Use stable, unique labels and index names for each managed graph. Match vector dimensions to the
embedding model and size `capacity`, `resizeCoefficient`, and `scalarKind` for the expected corpus.
Memgraph vector indexes use `READ_UNCOMMITTED` visibility, while text search uses its own index
snapshot; do not assume cross-index snapshot isolation during concurrent ingestion.

## Keep writes explicit

Choose a `conflict` and `orphanEntities` policy for every managed write. Anvia runs provisioning in
auto-commit sessions and document replacement or deletion in explicit atomic transactions. If a
graph and vector store must be updated together, persist application-owned reconciliation state
because those writes are not one distributed transaction.

## Own credentials and native queries

Use scoped credentials and private networking. Never expose `nativeDriver()` or arbitrary Cypher as
an Agent tool. A driver created from `uri` is closed with `MemgraphClient`; a supplied driver remains
caller-owned. Both ownership modes support `await using`.

Use opaque explorer IDs only for follow-up expansion. Application logic should rely on the stable
identity properties declared in the graph schema.
