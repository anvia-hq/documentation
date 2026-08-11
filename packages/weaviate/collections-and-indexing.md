# Collections and indexing

Automatic creation disables vectorizers, applies the selected vector distance, and defines reserved logical document ID and serialized document properties. It does not provision the application's metadata-property schema.

For production, create the collection with infrastructure automation, including replication, multi-tenancy mode, vector-index settings, and filterable properties, then use `createIfMissing: false`.

`vectorSize` is accepted by the connection options but the current adapter does not apply or validate it during collection creation. Ensure embedded vectors match the collection through deployment tests.

Metadata keys beginning with `__anvia_` are rejected. Deterministic object UUIDs help identify physical embeddings, but corpus replacement still needs explicit deletion for IDs no longer produced.
