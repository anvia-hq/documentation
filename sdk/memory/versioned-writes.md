# Versioned memory writes

A plain `append()` writes messages and returns nothing, so two writers can overwrite each other's assumptions
and a retried request can duplicate a turn. The optional versioned contract makes writes detectable and
idempotent. The SQLite, Postgres, Drizzle, Prisma, and in-memory stores implement it.

## 1. Read the history with its version

```ts anvia-check memory-versioned-example
import { InMemoryMemoryStore } from '@anvia/core/memory'

const store = new InMemoryMemoryStore()
const scope = { sessionId: 'support-42' }

const current = await store.loadVersioned({ scope })
const result = await store.append({
  scope,
  runId: 'run-1',
  turn: 0,
  messages: [{ role: 'user', content: 'My order has not arrived.' }],
  idempotencyKey: 'run-1:0',
  expectedVersion: current.version,
})

if (result.status === 'conflict') {
  // Someone wrote after `current` was read; reload, re-read the turn, and decide.
  console.warn('memory changed', current.version)
}
```

`loadVersioned()` returns `{ messages, version }`. The version is opaque: never parse it, compare it
lexically, or store it as a number. Pass it back as `expectedVersion` to reject a write when the history moved
in between.

## 2. Make writes idempotent

`idempotencyKey` names one logical write. Keys are scoped to the memory scope, and a store must commit a key at
most once:

| Result | Meaning |
| --- | --- |
| `committed` | The messages were written; `version` is the new version. |
| `duplicate` | The same key was already committed with the same content; nothing was written. |
| `conflict` | The key was committed with different content, or `expectedVersion` was stale; nothing was written. |

Derive the key from stable data — the run ID plus the write's position — not from a timestamp or random value.
Retrying a `duplicate` is safe; a `conflict` needs application reconciliation, not a blind retry. Omitting both
options keeps the legacy behaviour: an unversioned append.

Stores that do not implement `loadVersioned()` still satisfy `MemoryStore`; `append()` may return `void`, which
means `committed`. Treat optimistic concurrency as a capability, not a guarantee of every custom store.

Versioning is separate from transcript clearing. `clear()` removes the conversation but keeps the
idempotency ledger, so retrying an old key reports `duplicate` instead of restoring deleted history. If a
retention policy requires full erasure, delete the ledger rows through an application-owned maintenance path;
do not remove them routinely, because that weakens retry safety.

## 3. Use durable recorded memory

A durable agent can opt into recorded memory with `memory: { mode: 'recorded' }`. Its registration requires a
store that implements `loadVersioned()`, and each write becomes a durable `memory` operation keyed by the run
and write position. A conflicting write blocks the run as `needs_attention`; settle it with
`run.resolveMemoryWrite(operationKey, 'applied' | 'discarded')` after checking the store. Recorded memory
cannot be combined with registration compaction, a run that pauses for a human interaction, or a graph/owned
agent task, because those executions use synthetic session histories.

See [Custom stores](/sdk/memory/custom-stores) for the full interface and [Durable capabilities](/packages/durable/capabilities#supported-agent-features)
for the replay rules.
