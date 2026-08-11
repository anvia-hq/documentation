# Tables and indexing

With automatic creation enabled, the adapter runs `CREATE EXTENSION IF NOT EXISTS vector` and creates a table containing physical ID, logical document ID, JSONB document, JSONB metadata, and `vector(n)` embedding columns.

Production migrations should own both the table and an ANN index. Match the operator class to the adapter distance:

| Adapter distance | Query operator | Index family |
| --- | --- | --- |
| `cosine` | `<=>` | cosine operator class |
| `l2` | `<->` | L2 operator class |
| `innerProduct` | `<#>` | inner-product operator class |

Choose HNSW or IVFFlat and its tuning parameters for your workload, then verify with `EXPLAIN`. The adapter quotes validated table identifiers but does not generate migration SQL or indexes.
