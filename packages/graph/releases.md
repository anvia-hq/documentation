# Releases

The reviewed source release is `@anvia/graph` **1.1.5**.

## Changes through 1.1.5

Reviewed `1.1.4` → `1.1.5` against SDK source on 2026-10-15. Refreshed package READMEs with current overviews, quickstarts, and links to the detailed guides. Review the source changelog for any dependency changes included in your upgrade.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/graph/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.1.4` | Updated upstream runtime and schema dependencies across the workspace. |
| `1.1.3` | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents. |
| `1.1.2` | Moved zod to peerDependencies (`^4.4.0`), plus dependency updates. |
| `1.1.1` | Bumped upstream runtime dependencies and aligned zod to 4.5.4 across packages. |
| `1.0.12` | Updated the Core dependency to `1.0.10`. |
| `1.0.11` | Updated the Core dependency to `1.0.9`. |
| `1.0.10` | Added property-level graph-extraction conflict resolution with structured warnings and errors, durable ingestion receipts with optional graph-plus-vector orchestration, explorer source provenance, and shared-resource tenant namespaces for managed Neo4j graphs and Qdrant stores. |
| `1.0.9` | Updated the Core dependency to `1.0.8`. |
| `1.0.8` | Updated the Core dependency to `1.0.7`. |
| `1.0.7` | Updated the Core dependency to `1.0.6`. |
| `1.0.6` | Updated the Core dependency to `1.0.5`. |
| `1.0.5` | Updated the Core dependency to `1.0.4`. |
| `1.0.4` | Added raw-text graph ingestion helpers, shared deterministic chunking, and vector-document output that reuses graph chunk embeddings. |
| `1.0.3` | Introduced provider-neutral schemas, extraction, retrieval, evidence-aware Agent tools, and bounded graph exploration for Neo4j and Memgraph. |

Read the complete [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/graph/CHANGELOG.md).
