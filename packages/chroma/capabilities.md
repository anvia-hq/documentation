# Capabilities

- Dense vector ingestion using Chroma `upsert`.
- Query search, ID-only search, and `asTool()` integration.
- Logical document reconstruction from stored text and metadata.
- Multiple embeddings per logical document; results collapse to one best logical result.
- Equality, greater-than, less-than, `and`, and `or` filter translation.
- Collection creation with custom `metadata` and `configuration`.

Scores are normalized as `1 - distance`, so compare rankings within the same collection rather than assuming a universal threshold across backends.

The adapter does not generate embeddings, provision authentication, manage collection retention, or close an injected client. See [Embeddings](/sdk/knowledges/embeddings) and the [API reference](/packages/chroma/api-reference).
