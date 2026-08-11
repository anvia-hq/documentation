# Capabilities

`@anvia/memory-sqlite` implements the SDK memory store contract with ordered message persistence, error recording, inspection, and compaction support.

| Capability | Behavior |
| --- | --- |
| Load and append | Stores core messages in turn order |
| Clear | Deletes one scoped conversation and its dependent rows |
| Failed runs | Stored by default; set `errors: 'ignore'` to omit them |
| Validation | Enabled by default before messages cross the persistence boundary |
| Inspection | Read-only session listing and transcript access |
| Compaction | Atomic replacement with conflict detection and aggregate usage |

The adapter preserves strict JSON metadata and tool-result names when converting persisted messages. It does not authenticate callers, authorize a tenant, schedule compaction, or back up the database.

See [Memory concepts](/sdk/memory) and the complete [API reference](/packages/memory-sqlite/api-reference).
