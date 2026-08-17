# Capabilities

The Postgres adapter persists ordered messages and failed runs across processes. It also exposes the optional memory inspector and compaction store used by SDK and Studio features.

| Capability | Behavior |
| --- | --- |
| Shared persistence | Uses a `pg` client or pool |
| Append serialization | Advisory transaction lock by default |
| Schema bootstrap | `store.ensure()` creates `pgcrypto`, tables, and index |
| Custom names | Prefix or explicit table names |
| Inspection | Lists sessions and reads persisted transcripts |
| Compaction | Atomically replaces history with conflict detection |

The adapter owns persistence operations, not connection observability, tenant authorization, database backups, or migration orchestration. See the [API reference](/packages/memory-postgres/api-reference).
