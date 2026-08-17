# Schema and migrations

Generate the canonical DDL for your naming configuration:

```ts
import { createPostgresMemorySchemaSql } from '@anvia/memory-postgres'

const sql = createPostgresMemorySchemaSql({
  tablePrefix: 'assistant_',
})
```

The SQL creates `pgcrypto`, session, message, and error tables plus the unique message-position index. Apply it with your migration system, review privileges, and call `store.validate()` at runtime.

The schema uses generated UUIDs and cascading foreign keys. Renaming a prefix or explicit table name points the adapter at a different schema; it does not rename existing objects or copy data.

Re-generate and diff DDL after package upgrades. The [source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/memory-postgres/CHANGELOG.md) records contract changes, but your deployment owns rollout and rollback.
