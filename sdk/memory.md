# Memory

Memory gives an agent durable conversation history. A named session loads provider-neutral messages before each run and saves new user, assistant, tool-call, and tool-result messages for later turns.

Use memory for conversation continuity. Use [knowledge retrieval](/sdk/knowledges) for a large reference corpus, and use observability storage for traces and operational events.

## 1. Attach a store

```ts
import { Agent } from '@anvia/core'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'

const memoryClient = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memoryStore = memoryClient.memoryStore()
await memoryStore.ensure()

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Use conversation history when it is relevant.',
  memory: {
    store: memoryStore,
    savePolicy: 'turn',
  },
})
```

The core runtime owns when messages are loaded and appended. The adapter owns storage, ordering, scoping, concurrency, schema, and inspection.

## 2. Create a memory scope

```ts
const session = {
  sessionId: 'thread_123',
  userId: 'user_456',
  metadata: { tenantId: 'tenant_789' },
}
await supportAgent.generate({
  prompt: 'Remember that my project is named Anvia.',
  session,
})
const result = await supportAgent.generate({
  prompt: 'What is my project named?',
  session,
})
if (result.status === 'completed') {
  console.log(result.output)
}
```

The same session ID, user ID, and scoped metadata reconnect later calls to the same transcript.

## 3. Know when memory is active

Memory is active only when a run includes a `session` scope:

```ts
await supportAgent.generate({
  prompt: 'This run does not load or save session memory.',
})

await supportAgent.generate({
  prompt: 'This run uses the configured memory store.',
  session: { sessionId: 'thread_123', userId: 'user_456' },
})
```

Passing `session` to an agent without a configured memory store does not persist history. A scoped run accepts `prompt`, not a `messages` transcript, because it loads history from the store.

## 4. Keep the product boundary explicit

Memory stores model context, not authorization. Your application must verify that the authenticated actor may access the requested session before constructing it.

Stored transcripts can contain private user input, retrieved data, reasoning identifiers, tool arguments, tool results, and model output. Apply tenant isolation, encryption, retention, deletion, export, and audit policy to the full message record.

## Explore memory

- [Configure memory](/sdk/memory/configure) attaches a durable adapter and defines scope.
- [Sessions](/sdk/memory/sessions) runs, streams, inspects, and clears conversations.
- [Save policies](/sdk/memory/save-policies) chooses the durability boundary during a run.
- [Compaction](/sdk/memory/compaction) summarizes an older transcript prefix.
- [Store adapters](/sdk/memory/store-adapters) covers Prisma, Drizzle, Postgres, and SQLite.
- [Custom stores](/sdk/memory/custom-stores) implements the core contracts.

Continue with [Configure memory](/sdk/memory/configure).
