# Tables and indexing

`ensure()` creates an empty table containing Anvia's reserved document, ID, and vector columns when missing. `validate()` requires the named table to exist.

The adapter adds rows through `table.add()` and does not create a LanceDB scalar or vector index. For a growing production corpus:

1. Provision or open the durable table outside request handling.
2. Create and tune indexes through LanceDB administration.
3. Define how a source refresh deletes or replaces prior physical rows.
4. Run compaction or optimization according to your LanceDB deployment.

`vectorSize` documents the intended model dimension in the connection options, but the current adapter does not validate it against the table. Test dimension compatibility before ingestion.
