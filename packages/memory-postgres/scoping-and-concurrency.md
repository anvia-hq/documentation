# Scoping and concurrency

Conversation identity defaults to `[sessionId, userId]`. Add tenant metadata or provide a deterministic scope function when those values can collide.

Appends run in a transaction. With the default `lock: 'advisory'`, the adapter acquires `pg_advisory_xact_lock(hashtext(scopeKey))` before reading the current position and inserting messages. That serializes writers for the same scope while allowing unrelated conversations to proceed.

`lock: 'none'` removes that protection and can expose concurrent position conflicts. Choose it only when a queue, application mutex, or another database protocol guarantees one writer per conversation.

Scopes are not row-level security. Enforce tenant authorization independently, and consider Postgres RLS only with a deliberately configured connection/session strategy.
