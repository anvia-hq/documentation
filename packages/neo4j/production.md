# Production boundaries

## Own ingestion policy

The application owns file discovery, reads, source metadata, model loading, retries, scheduling, and
failure policy. `ingestGraphText()` and `ingestGraphDocuments()` provide deterministic shared
chunking and perform extraction and embedding before the database transaction, so a partial model
failure cannot create a partially extracted graph. Use `prepareGraphDocuments()` when the
application needs to orchestrate preparation and writes separately.

Choose `conflict: 'error'` unless the product has an explicit overwrite or keep-existing policy. Choose whether orphaned entities are deleted or retained for every replacement and deletion operation.

## Bound retrieval

Set explicit seeds, `topK`, hybrid candidate counts, RRF constant, relationship allowlist, direction, depth, node count, relationship count, and evidence count. Validate that every selected vector index uses the embedding model's dimensions.

Bound exploration too. Treat returned element IDs as opaque, short-lived expansion handles rather
than stable identifiers.

## Handle transactions and retries

Package operations use explicit transactions and do not invoke Neo4j managed retry APIs. An abort signal rolls back the active transaction. If an operation is safe to retry, retry the complete application operation with idempotent inputs.

## Own the driver

When `Neo4jClient` creates a driver from `uri` and `auth`, closing or disposing the client closes that driver. When the application supplies `driver`, the driver remains caller-owned.

Use scoped Neo4j credentials, TLS, private networking, backups, monitored index population, and migration rehearsals. Do not expose `nativeDriver()` or arbitrary Cypher as an Agent tool.
