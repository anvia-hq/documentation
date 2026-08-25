# Capabilities

| Surface | Portable contract | Adapter responsibility |
| --- | --- | --- |
| Schema | Typed nodes, relationships, identities, strict properties | Validate supported database values |
| Extraction | Schema-valid entities, relationships, and mentions | None |
| Ingestion | Chunk, extract, embed, and prepare document-scoped writes | Atomic replace/delete implementation |
| Retrieval | Vector/hybrid seeds, bounded traversal, explicit evidence | Index search and graph queries |
| Agent tools | Shared `createGraphSearchTool()` | Implement `GraphContextRetriever` |
| Exploration | Bounded overview and expansion result types | Implement `GraphExplorer` |

Managed graphs implement `GraphDocumentWriter` and can receive `ingestGraphText()` or
`ingestGraphDocuments()`. Existing graph registrations are read-only and cannot be passed to those
helpers. The type system preserves that boundary.

Evidence is also capability-aware. A managed graph can hydrate `{ type: 'chunks', maxChunks }` from
Anvia-owned provenance. An existing graph accepts `{ type: 'none' }` because it does not own those
document and chunk records.

All graph operations expose explicit limits and an optional `AbortSignal`. Applications still own
authorization, retry policy, source discovery, scheduling, and cross-system consistency.
