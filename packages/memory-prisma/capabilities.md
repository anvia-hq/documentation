# Capabilities

The Prisma adapter provides durable ordered memory while keeping schema, migrations, and database connectivity in the application.

| Capability | Delegate requirement |
| --- | --- |
| Core load/append/clear | Session and message CRUD plus transaction |
| Error recording | Error delegate, unless `errorPolicy: 'ignore'` |
| Inspection | Session `findMany` and `findUnique` |
| Compaction | Session `findUnique`, including on the transaction delegate |

Optional delegate methods determine whether `inspector` and `compaction` are exposed. This lets custom clients implement the base store without pretending unsupported features exist.

Compaction stores a summary checkpoint on the session and preserves canonical message rows. Normal
loads and inspection return the complete transcript; model-facing snapshots return the latest
summary plus the unsummarized tail. The optional message `deleteMany` delegate remains accepted for
source compatibility but is not used for compaction.

Message validation defaults on, and strict JSON metadata and tool-result names are preserved. Authentication, authorization, Prisma migrations, retries, and client disconnect remain application concerns.
