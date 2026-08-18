# Production boundaries

## Own ingestion policy

The application owns file discovery, reads, chunking, source metadata, entity embedding text, model loading, retries, scheduling, and failure policy. Keep model extraction separate from the database transaction so a partial provider failure cannot create a partially extracted graph.

Choose `conflict: 'error'` unless the product has an explicit overwrite or keep-existing policy. Choose whether orphaned entities are deleted or retained for every replacement and deletion operation.

## Bound retrieval

Set explicit seeds, `topK`, hybrid candidate counts, RRF constant, relationship allowlist, direction, depth, node count, relationship count, and evidence count. Validate that every selected vector index uses the embedding model's dimensions.

## Handle transactions and retries

Package operations use explicit transactions and do not invoke Neo4j managed retry APIs. An abort signal rolls back the active transaction. If an operation is safe to retry, retry the complete application operation with idempotent inputs.

## Own the driver

When `Neo4jClient` creates a driver from `uri` and `auth`, closing or disposing the client closes that driver. When the application supplies `driver`, the driver remains caller-owned.

Use scoped Neo4j credentials, TLS, private networking, backups, monitored index population, and migration rehearsals. Do not expose `nativeDriver()` or arbitrary Cypher as an Agent tool.
