# Memory

Memory gives an agent durable conversation history. Attach a store, pass the same session scope to every run in a conversation, and Anvia loads earlier messages before the run and saves new ones afterward.

## When to use it

- Follow-up questions should see earlier turns, tool calls, and tool results.
- Conversations must survive restarts, so history belongs in a database rather than the browser.
- Long conversations need a summary checkpoint to stay within the model's context window.
- You need control over whether a failed run leaves partial history behind.
- Use [knowledge retrieval](/sdk/knowledges) instead for a large reference corpus.

## How it works

Configure `memory.store` on the agent. Memory is active only for runs that pass a `session` scope: a `sessionId` plus optional `userId` and JSON `metadata`. Official adapters key storage by `sessionId` and `userId`, and can include selected metadata keys such as a tenant ID.

```ts
import { Agent } from '@anvia/core'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const memoryStore = new SqliteMemoryClient({ path: 'data/anvia-memory.sqlite' }).memoryStore()
await memoryStore.ensure()

const supportAgent = new Agent({
  id: 'support',
  model,
  memory: { store: memoryStore, savePolicy: 'turn' },
})

const session = { sessionId: 'thread_123', userId: 'user_456' }
await supportAgent.generate({ prompt: 'Remember that my project is named Anvia.', session })
const result = await supportAgent.generate({ prompt: 'What is my project named?', session })
if (result.type === 'response') console.log(result.output)
```

Choose a store that matches the database you already run:

- `InMemoryMemoryStore` from `@anvia/core` for tests and prototypes; nothing survives the process.
- `@anvia/memory-sqlite` for local tools, tests, and small single-node deployments.
- `@anvia/memory-postgres`, `@anvia/memory-prisma`, or `@anvia/memory-drizzle` for production databases and existing migration workflows.

`savePolicy` sets the durability boundary: `'message'` (default) saves each completed message batch, `'turn'` saves complete model-and-tool turns, and `'run'` saves only after a response outcome. Opt-in `compaction` with `createSummaryMemoryCompactor()` stores a summary checkpoint for older history; the canonical transcript is not deleted.

## What your application owns

- Authorization. A session scope addresses stored history; it does not grant access. Verify the authenticated actor may use the requested session before constructing it.
- Tenant isolation, encryption, retention, deletion, and export for full message records, including tool arguments and results.
- Database provisioning, schema migrations, and connection credentials.
- Side-effect safety. Save policy does not roll back tools that already ran.

## Go deeper

- [Memory](/sdk/memory): attach a store and create a memory scope.
- [Sessions](/sdk/memory/sessions): run, stream, inspect, and clear conversations.
- [Save policies](/sdk/memory/save-policies): choose when messages are persisted.
- [Compaction](/sdk/memory/compaction): summarize older history for model context.
- [Store adapters](/sdk/memory/store-adapters): compare Prisma, Drizzle, Postgres, and SQLite.
- [Custom stores](/sdk/memory/custom-stores): implement the core memory contracts.
- [SQLite memory](/packages/memory-sqlite/get-started), [Postgres memory](/packages/memory-postgres/get-started), [Prisma memory](/packages/memory-prisma/get-started), [Drizzle memory](/packages/memory-drizzle/get-started): package setup.
