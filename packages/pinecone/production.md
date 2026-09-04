# Production

- Pre-provision the index with the correct dimension and metric.
- Use `validate()` so startup fails when the provisioned index is missing or incompatible.
- Inject a client when credentials, retries, and endpoint policy are centrally managed.
- Version corpus namespaces deliberately and remove stale records.
- Monitor vector count, metadata size, request units, and provider limits.
- Calibrate score thresholds per metric and corpus.

`upsert()` deletes the stored records of each incoming document ID before re-inserting, so changed chunking replaces cleanly within ingested documents. Cross-document and corpus cleanup, namespace rotation, and closing an injected client remain application and infrastructure responsibilities.

Provider filtering is not authorization. Validate tenant access before constructing a query even when every request includes a tenant filter.
