# Production

- Pre-provision the index with the correct dimension and metric.
- Use `validate()` so startup fails when the provisioned index is missing or incompatible.
- Inject a client when credentials, retries, and endpoint policy are centrally managed.
- Version corpus namespaces deliberately and remove stale records.
- Monitor vector count, metadata size, request units, and provider limits.
- Calibrate score thresholds per metric and corpus.

The adapter does not delete superseded chunks, rotate namespaces, or close an injected client. Those are application and infrastructure responsibilities.

Provider filtering is not authorization. Validate tenant access before constructing a query even when every request includes a tenant filter.
