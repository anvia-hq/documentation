# Custom stores

Implement `MemoryStore` only when the official database adapters do not fit the application's storage layer.

## Implement the contract

```ts
import type { MemoryStore } from '@anvia/core'

export const memoryStore: MemoryStore = {
  async load(context) {
    return readStoredMessages(context)
  },

  async append(input) {
    await appendMessages({
      context: input.context,
      runId: input.runId,
      turn: input.turn,
      messages: input.messages,
    })
  },

  async clear(context) {
    await clearStoredMessages(context)
  },

  async recordError(input) {
    await recordFailedRun(input)
  },
}
```

`load(...)`, `append(...)`, and `clear(...)` are required. `recordError(...)` is optional and stores failed-run diagnostics separately from normal conversation messages.

## Preserve the context

Every operation receives the same memory scope:

```ts
type MemoryContext = {
  sessionId: string
  userId?: string
  metadata?: JsonObject
}
```

Use the complete scope consistently for loading, appending, clearing, and error recording. Preserve message order and store the full provider-neutral `Message` value rather than only visible assistant text.

## Handle repeat writes

`runId` and `turn` identify append points. Use them to make retried or concurrent writes safe for the guarantees of your database.

Reject persistence failures so the session prompt does not silently continue with incomplete memory.

## Support compaction only when needed

Automatic [compaction](/sdk/memory/compaction) requires the optional `MemoryCompactionStore`. Its commit must compare an opaque revision and replace the compacted prefix atomically; return `'conflict'` instead of overwriting a newer transcript.
