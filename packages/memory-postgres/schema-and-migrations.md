# Schema and migrations

Generate the canonical DDL for your naming configuration:

```ts
import { createPostgresMemorySchemaSql } from '@anvia/memory-postgres'

const sql = createPostgresMemorySchemaSql({
  tablePrefix: 'assistant_',
})
```

The SQL creates `pgcrypto`, session, message, error, and action-idempotency tables plus the unique
message-position index. The ledger table defaults to `anvia_memory_idempotency_keys` (rename it with
`tableNames.idempotencyKeys`); `append()` needs it when a caller supplies `idempotencyKey` or
`expectedVersion`, and a missing table fails the write rather than silently dropping the guarantee. Apply it with your migration system, review privileges, and call `store.validate()` at runtime.

The session table includes nullable JSONB `compaction_state`. It stores the latest summary checkpoint
and canonical message boundary; compaction does not remove covered messages. The generated SQL uses
`ADD COLUMN IF NOT EXISTS` for an existing adapter-managed table. Application-managed deployments
should apply and verify that additive migration before the new adapter version starts.

The schema uses generated UUIDs and cascading foreign keys. Renaming a prefix or explicit table name points the adapter at a different schema; it does not rename existing objects or copy data.

Re-generate and diff DDL after package upgrades. The [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/memory-postgres/CHANGELOG.md) records contract changes, but your deployment owns rollout and rollback.
