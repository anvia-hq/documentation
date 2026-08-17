# Custom stores

Implement `MemoryStore` when the official adapters do not fit the application's storage layer. The core contract is deliberately small: load ordered messages, append one completed batch, and clear one scoped conversation.

## 1. Implement the required methods

```ts
import type { Message } from '@anvia/core'
import type {
  MemoryAppendOptions,
  MemoryScope,
  MemoryStore,
} from '@anvia/core/memory'

export class ProductMemoryStore implements MemoryStore {
  async load({ scope }: { scope: MemoryScope }): Promise<Message[]> {
    const rows = await db.memoryMessages.findMany({
      where: scopeWhere(scope),
      orderBy: { position: 'asc' },
    })

    return rows.map((row) => parseStoredMessage(row.message))
  }

  async append(input: MemoryAppendOptions): Promise<void> {
    if (input.messages.length === 0) return

    await appendOrderedMessagesAtomically({
      scope: input.scope,
      runId: input.runId,
      turn: input.turn,
      messages: input.messages,
    })
  }

  async clear({ scope }: { scope: MemoryScope }): Promise<void> {
    await deleteConversation(scopeWhere(scope))
  }
}
```

`load()`, `append()`, and `clear()` are required. Preserve every normalized message field and return history in model order.

The core runtime passes the same context shape to every method:

```ts
type MemoryScope = {
  sessionId: string
  userId?: string
  metadata?: JsonObject
}
```

Define one deterministic storage key from the complete scope required by the product. Apply it identically to reads, writes, deletion, errors, inspection, and compaction.

## 2. Make appends safe

Each append receives `runId`, `turn`, and an ordered `Message[]` batch. Use a transaction, lock, compare-and-swap, or database constraint so concurrent writers cannot assign duplicate positions or interleave a batch.

Use `runId` and `turn` as idempotency information when the storage system can replay writes. Do not silently discard a persistence failure; reject so the agent run can follow its failure path.

## 3. Record failures separately

`recordError()` is optional:

```ts
import type {
  MemoryErrorOptions,
} from '@anvia/core/memory'

async recordError(input: MemoryErrorOptions): Promise<void> {
  await db.memoryErrors.create({
    data: {
      scopeKey: scopeKey(input.scope),
      runId: input.runId,
      error: serializeSafeError(input.error),
      messages: input.messages,
    },
  })
}
```

Error records are operational diagnostics. `load()` must not mix them into normal conversation context.

## 4. Add read-only inspection when needed

Expose an optional `inspector` with:

- `listConversations({ limit, userId? })` returning conversation summaries; and
- `getConversation(ref)` returning one summary plus ordered message records.

The `ref` value is an opaque store-owned identifier used to retrieve that exact conversation. This capability lets Studio and internal tooling inspect memory without teaching core about the database schema.

## 5. Add atomic compaction when needed

Automatic [compaction](/sdk/memory/compaction) requires an optional `compaction` capability:

```ts
import type { MemoryCompactionCapability } from '@anvia/core/memory'

const compaction: MemoryCompactionCapability = {
  async snapshot({ scope }) {
    return loadRevisionAndMessages(scope)
  },

  async replacePrefix(input) {
    return replacePrefixIfRevisionMatches({
      scope: input.scope,
      expectedRevision: input.revision,
      messageCount: input.messageCount,
      replacement: input.replacement,
      runId: input.runId,
    })
  },
}
```

`snapshot()` returns an opaque revision and ordered messages. `replacePrefix()` must atomically compare that revision, replace exactly the requested prefix with the supplied compaction message, and return `{ status: 'committed' }` or `{ status: 'conflict' }`.

Never overwrite a newer transcript after a conflict. Let the core runtime reload and retry according to the configured conflict limit.

Test empty histories, repeated appends, concurrent writers, failed transactions, full-scope deletion, error isolation, malformed stored messages, compaction conflicts, and message-order preservation before using a custom store in production.
