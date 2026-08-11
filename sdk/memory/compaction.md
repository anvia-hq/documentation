# Compaction

Compaction replaces an older transcript prefix with a durable summary while preserving recent turns.

## Configure automatic compaction

```ts
import {
  AgentBuilder,
  createSummaryMemoryCompactor,
} from '@anvia/core'

const agent = new AgentBuilder('support', model)
  .memory(memoryStore, {
    savePolicy: 'turn',
    compaction: {
      maxMessages: 40,
      keepRecentUserTurns: 4,
      compactor: createSummaryMemoryCompactor(summaryModel, {
        maxTokens: 1024,
      }),
    },
  })
  .build()
```

When stored history plus the incoming prompt exceeds `maxMessages`, Anvia summarizes older messages and retains the configured number of complete user-led turns.

## Choose the threshold

Start `maxMessages` around half of the message budget you want in the main prompt. Retaining three to six recent user turns usually keeps the live conversation intact.

Compaction adds a summarization model call before the main completion. Its tokens contribute to total run usage, so choose `summaryModel` deliberately for cost, quality, and data handling.

## Storage requirements

The Prisma, Drizzle, Postgres, and SQLite adapters support atomic compaction. A custom store must expose `MemoryCompactionStore` and replace the transcript prefix only when its revision still matches.

Conflicting concurrent writes are retried once by default. Exhausted conflicts raise `MemoryCompactionConflictError`; failed or empty summaries raise `MemoryCompactionError` before the main model call.

Compaction is conversation housekeeping, not an audit archive. Keep run events and traces in their dedicated stores.
