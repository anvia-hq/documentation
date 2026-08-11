# Scoping and concurrency

By default, scope is serialized from `sessionId` and `userId`. Add tenant metadata or provide a deterministic function when those identifiers are not globally unique.

Appends use the supplied Prisma transaction callback. The adapter reads the last position and creates the next batch inside that transaction, but its contract does not add a database-specific advisory lock. Concurrent writers should use a suitable isolation level and handle database serialization or unique-position failures at the application boundary.

Retries must repeat only idempotent surrounding work; a model run or external tool call may not be safe to execute twice.

Scope is not access control. Resolve and authorize the user, session, and tenant before building the memory context.
