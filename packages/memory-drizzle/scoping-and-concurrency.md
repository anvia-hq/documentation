# Scoping and concurrency

The default scope combines `sessionId` and `userId`; `metadataKeys` add stable nested metadata values. A custom function can construct the key directly.

Every append runs inside a database transaction; the constructor throws `TypeError` when the supplied Drizzle database lacks `transaction`. Advisory locking is enabled by default and requires `execute`; the constructor throws `TypeError` for the default `lock: 'advisory'` when `execute` is missing. The lock serializes appends for the same scope before positions are assigned.

`lock: 'none'` deliberately disables the advisory lock and its `execute` requirement. Use it only when your own queue or transaction layer prevents concurrent writers from producing position conflicts.

Scope keys partition history but do not authorize access. Check tenant and user permissions before the memory context reaches the adapter.
