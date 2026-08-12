# Share conversation memory with PostgreSQL

**Level:** Pattern · **Estimated time:** 35 minutes

## Outcome

Attach the PostgreSQL `MemoryStore` to an agent so independently scaled application workers can
resume the same explicitly scoped conversation.

## When to use it

Use this pattern when several server processes must share conversation history. For a concrete
single-process walkthrough, use the [SQLite memory
example](/examples/data-and-workflows/persistent-memory). Use knowledge retrieval for shared
reference material. Memory is not a substitute for identity or application state.

## Flow

authenticate → resolve application conversation → `agent.session(sessionId, { userId })` → load
history → prompt → append completed messages. The memory adapter owns durable storage mechanics.

## Setup

Install the PostgreSQL adapter; it includes its `pg` runtime dependency:

```sh
pnpm add @anvia/core @anvia/openai @anvia/memory-postgres
```

## Attach the store

```ts
import { AgentBuilder } from "@anvia/core/agent";
import { createPostgresMemoryStore } from "@anvia/memory-postgres";

const memory = await createPostgresMemoryStore({
  connectionString: process.env.DATABASE_URL,
});
const agent = new AgentBuilder("assistant", model)
  .instructions("Use prior conversation only when relevant.")
  .memory(memory)
  .build();

const session = agent.session(conversation.id, { userId: principal.id });
const response = await session.prompt(question).send();
```

Set `createIfMissing: false` when migrations provision the schema. Never allow an arbitrary web
request to create database objects. The in-repository cookbook uses a small `MemoryStore`
implementation to make the underlying contract visible.

## Expected behavior

Two prompts using the same authorized session can reference earlier turns. A new session starts
without that history. A different user cannot select the session merely by knowing its ID because
the application authorizes the conversation before constructing it.

## Failure cases

Concurrent turns, partial model failures, very long histories, deleted users, adapter downtime,
and retry duplication need policy. Decide whether memory errors fail the request or continue
without persistence, and make that degradation visible.

## Security and ownership

The application owns conversation authorization, retention, export, deletion, encryption, and
legal basis. `userId` is scope metadata, not authentication. Never accept it as proof of identity
from the request body.

## Production changes and tests

Use migrations, connection pooling, transaction/locking settings appropriate to the adapter,
history compaction, quotas, and redacted observability. Test resume, isolation, concurrent append,
failed completion, deletion, compaction, adapter outage, and retry behavior.

## Runnable references

- [Conversation memory contract](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/02-conversation-memory.ts)
- [Session memory](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/06-session-memory.ts)

## Extensions

Add conversation listing, summaries, user-controlled deletion, a memory inspector, and tenant-aware
scope as shown in [multi-tenant memory](/examples/knowledge-and-data/multi-tenant-memory).
