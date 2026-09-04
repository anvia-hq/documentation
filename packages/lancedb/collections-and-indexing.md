# Tables and indexing

`ensure()` creates an empty table containing Anvia's reserved row ID, document ID, document, metadata, and vector columns when missing, then validates it. `validate()` requires the named table to exist and checks its schema.

The adapter replaces rows for re-ingested document IDs — deleting matches before `table.add()` — and does not create a LanceDB scalar or vector index. For a growing production corpus:

1. Provision or open the durable table outside request handling.
2. Create and tune indexes through LanceDB administration.
3. Delete rows for document IDs that leave the corpus; re-upserted IDs are replaced automatically.
4. Run compaction or optimization according to your LanceDB deployment.

`dimensions` is required and validated: the constructor rejects non-positive values, and `validate()` throws when the `__anvia_vector` column's list size differs from the configured dimensions.
