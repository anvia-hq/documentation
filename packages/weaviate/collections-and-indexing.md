# Collections and indexing

Automatic creation disables vectorizers, applies the selected vector distance, and defines reserved logical document ID and serialized document properties. It does not provision the application's metadata-property schema.

For production, create the collection with infrastructure automation, including replication, multi-tenancy mode, vector-index settings, and filterable properties, then call `validate()` at startup.

The store's `dimensions` option is enforced locally: construction rejects non-positive values, `upsert()` rejects documents whose embedding vectors do not match the configured dimension, and `search()` rejects query vectors of the wrong length.

Metadata keys beginning with `__anvia_` are rejected. Deterministic object UUIDs help identify physical embeddings, but corpus replacement still needs explicit deletion for IDs no longer produced.
