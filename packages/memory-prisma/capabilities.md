# Capabilities

The Prisma adapter provides durable ordered memory while keeping schema, migrations, and database connectivity in the application.

| Capability | Delegate requirement |
| --- | --- |
| Core load/append/clear | Session and message CRUD plus transaction |
| Error recording | Error delegate, unless `errors: 'ignore'` |
| Inspection | Session `findMany` and `findUnique` |
| Compaction | Message `deleteMany` |

Optional delegate methods determine whether `inspector` and `compaction` are exposed. This lets custom clients implement the base store without pretending unsupported features exist.

Message validation defaults on, and strict JSON metadata and tool-result names are preserved. Authentication, authorization, Prisma migrations, retries, and client disconnect remain application concerns.
