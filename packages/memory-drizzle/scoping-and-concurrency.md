# Scoping and concurrency

The default scope combines `sessionId` and `userId`; `metadataKeys` add stable nested metadata values. A custom function can construct the key directly.

The adapter uses a database transaction when the supplied Drizzle database supports one. Advisory locking is also enabled by default when `execute` is available, serializing appends for the same scope before positions are assigned.

Custom database wrappers may omit those optional capabilities. In that case, verify that your own queue or transaction layer prevents concurrent writers from producing position conflicts. `lock: 'none'` deliberately disables the advisory lock.

Scope keys partition history but do not authorize access. Check tenant and user permissions before the memory context reaches the adapter.
