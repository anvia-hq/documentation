# Memory

Memory gives an agent durable conversation history. Each session loads stored messages before a run and saves new runtime messages for the next turn.

## Explore memory

| Page | Learn how to |
| --- | --- |
| [Configure memory](/sdk/memory/configure) | Attach durable storage to an agent. |
| [Sessions](/sdk/memory/sessions) | Continue, inspect, and clear a conversation. |
| [Save policies](/sdk/memory/save-policies) | Choose when completed messages are persisted. |
| [Compaction](/sdk/memory/compaction) | Summarize old history while retaining recent turns. |
| [Store adapters](/sdk/memory/store-adapters) | Choose Prisma, Drizzle, Postgres, or SQLite. |
| [Custom stores](/sdk/memory/custom-stores) | Implement the core storage contract. |

## How memory works

```text
Session → load history → run agent → append new messages
```

Anvia stores provider-neutral [messages](/sdk/messages), including user prompts, assistant responses, tool calls, and tool results. A stable session ID reconnects later runs to that transcript.

## Memory is model context

Memory answers, “What should the model remember next time?” It is not an analytics log, trace store, or event replay system. Keep those operational records separate.

Your application still owns authentication, session authorization, tenant isolation, retention, and deletion. Treat stored tool arguments and results as sensitive application data.
