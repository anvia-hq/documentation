# Memory

Studio's Memory page lets you inspect the conversations that an agent can remember. It groups persisted messages by memory source, user, and conversation, then exposes the raw records and a derived transcript for debugging.

Open `http://localhost:4021/memory`. The compatibility path `http://localhost:4021/ui/memory` redirects to the same page with the default UI configuration.

## Two kinds of memory

Studio can show two different sources. They serve different purposes and should not be treated as interchangeable.

| Source | What it contains | When Studio shows it |
| --- | --- | --- |
| **Agent memory** | Conversations stored by the memory configured on an agent. | The agent has a `MemoryStore`. Studio reads it through the store's optional `inspector`. |
| **Studio sessions** | Playground sessions and transcripts kept by Studio's session store. | As a fallback for registered agents that do not have agent memory. |

Every Studio instance has an in-memory session store by default unless sessions are disabled. This makes the Playground work immediately, but it does **not** add memory to the agent itself. The default store disappears when the Studio process stops.

If an agent has its own memory store, that source takes precedence on the Memory page. When several agents share the same store instance, Studio de-duplicates it and presents one **Shared agent memory** source associated with those agents.

## Make agent memory inspectable

Anvia's SQLite, Postgres, Drizzle, and Prisma memory adapters expose the optional read-only `MemoryInspector` interface. Register one with the agent as usual:

```ts
import { Agent } from '@anvia/core/agent'
import { SqliteMemoryClient } from '@anvia/memory-sqlite'
import { Studio } from '@anvia/studio'

const memoryClient = new SqliteMemoryClient({
  path: 'data/anvia-memory.sqlite',
})
const memory = memoryClient.memoryStore()
await memory.ensure()

const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})

new Studio([agent]).start({ port: 4021 })
```

Existing conversations appear automatically. Studio queries the adapter directly; it does not copy messages into its session database or require a Studio-specific migration.

A custom `MemoryStore` can still load, append, and clear agent memory without implementing `inspector`. Studio will list that source as unavailable because it cannot safely discover conversations from it. Add these read-only operations if you want the custom store to appear:

```ts
import type { MemoryInspector, MemoryStore } from '@anvia/core/memory'

const inspector: MemoryInspector = {
  listConversations: ({ limit, userId }) =>
    listStoredConversations({ limit, userId }),
  getConversation: ({ ref }) => getStoredConversation(ref),
}

const memory: MemoryStore = {
  inspector,
  load: ({ scope }) => loadMessages(scope),
  append: (input) => appendMessages(input),
  clear: ({ scope }) => clearMessages(scope),
}
```

Conversation references are opaque and store-specific. Pass the exact `ref` returned by `listConversations()` to `getConversation()` rather than reconstructing it from a session ID.

## Explore users and conversations

Select a source at the top of the page, then narrow its conversations by user. Studio derives the Users rail from conversation metadata and shows:

- the user ID, conversation count, associated agents, and latest interaction;
- the conversation title or session ID, message count, and update time;
- the source kind and adapter `kind`, when the store reports one;
- conversation metadata and ordered message records.

Conversations without a user ID are grouped under `default`. That label is a development fallback, not an authenticated application user.

The inspector is a browser for persisted state. It does not edit messages, clear memory, manage users, or enforce tenant authorization. The application remains responsible for access control and for choosing a safe memory scope. See [Memory sessions](/sdk/memory/sessions) and [Store adapters](/sdk/memory/store-adapters) for the runtime model.

## Read messages, records, and transcript steps

For a selected conversation, Studio presents several views over the same persisted history:

| View | Purpose |
| --- | --- |
| **Messages** | The ordered Anvia `Message[]` consumed by the agent. |
| **Message records** | The message plus its position, run ID, turn, and creation time. |
| **Derived transcript** | A UI-oriented sequence of user and assistant text, reasoning, and tool calls. |
| **Assistant responses** | A compact generation ledger derived from assistant-message metadata. |

The generation ledger shows the provider, model, token usage, turn, timestamp, and a response preview when that metadata was persisted. An assistant message without generation metadata remains visible and is labeled **Usage unavailable**; Studio does not estimate missing usage.

This is useful for questions such as:

- Did the expected user and session scope resolve to the same conversation?
- Which run and turn appended a particular message?
- Did tool calls and results persist in the expected order?
- Which provider and model produced an assistant response?
- Was token usage attached before the message reached the store?

## Persist Studio's development history

Agent memory and Studio's own session history can use separate stores. If you only want Playground sessions, local traces, and pipeline history to survive a restart, configure Studio's SQLite store:

```ts
import { createSqliteSessionStore, Studio } from '@anvia/studio'

const studioStore = createSqliteSessionStore({
  path: '.anvia-studio/studio.sqlite',
})

new Studio([agent], {
  stores: {
    sessions: studioStore,
    traces: studioStore,
    pipelineLogs: studioStore,
    pipelineRuns: studioStore,
  },
}).start({ port: 4021 })
```

This changes where Studio keeps its development records. It does not replace a memory store already configured on the agent. See [Sessions](/studio/sessions) for the Playground lifecycle and [Traces](/studio/traces) for local run inspection.

## API surface

The UI reads the same read-only endpoints available to local development clients:

```text
GET /memory/sources
GET /memory/sources/:sourceRef/users?limit=50
GET /memory/sources/:sourceRef/conversations?limit=100&userId=...
GET /memory/sources/:sourceRef/conversations/:conversationRef/messages
GET /memory/sources/:sourceRef/conversations/:conversationRef/steps
```

Treat these routes as a trusted development surface. They can expose prompts, tool arguments and results, model output, metadata, and user identifiers from the connected store. Do not publish Studio as a production memory administration API.
