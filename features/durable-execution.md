# Durable execution

Durable execution lets agent runs survive a process restart. `@anvia/durable` records submissions, model
responses, tool results, approvals, and progress in a database, then continues unfinished work from those
committed results instead of starting over.

::: warning Experimental
`@anvia/durable` is experimental. Database records may change between releases.
:::

## When to use it

- An agent run can outlast a request, deploy, or crash and must continue rather than restart.
- Retried requests must not start duplicate runs.
- Work waits on a person's approval, a timer, or an external callback.
- A fixed set of agent tasks with dependencies must run to completion as one graph.
- Several workers should share queued runs from one Postgres database.

## How it works

Open one `DurableRuntime` with a store and the agents it may run. Each submission is stored before work
starts and deduplicates by `sessionId` and `requestId`. On startup, `resume()` reschedules unfinished work:
committed model responses and tool results are replayed, never executed again. This is
operation-result replay, not JavaScript stack restoration, and there is no exactly-once guarantee for
external services.

```ts
import { Agent } from '@anvia/core/agent'
import { DurableRuntime } from '@anvia/durable'
import { PostgresDurableStore } from '@anvia/durable/postgres'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const assistant = new Agent({
  id: 'assistant',
  model: client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' }),
  instructions: 'Answer from the supplied information. State uncertainty explicitly.',
})

const runtime = await DurableRuntime.open({
  store: new PostgresDurableStore({ connectionString: process.env.DATABASE_URL! }),
  agents: [{ agent: assistant, version: '1' }],
  onFatalError: (error) => console.error('Durable owner failed', error),
})
await runtime.resume() // continue unfinished work from the previous process

const run = await runtime.submit({ agentId: 'assistant', sessionId: 'tenant-42:conversation-7', requestId: 'message-123', prompt: 'Summarize the incident notes.' })
const outcome = await run.result()
```

The Postgres store verifies its tables by default; pass `{ schema: 'create' }` as its second argument once
to create them. Stores are available for SQLite (`@anvia/durable/sqlite`), Postgres
(`@anvia/durable/postgres`), Drizzle (`@anvia/durable/drizzle`), and Prisma (`@anvia/durable/prisma`).
SQLite supports one owning runtime on one host; the SQL stores also support shared workers.

Beyond single runs, `runtime.submitGraph()` persists a static graph of agent tasks with dependencies, and
`defineTask()` with `runtime.submitTask()` covers dynamic subagents, timers, signals, and custom work.

### Durable workflows and Pipelines

A [Pipeline](/sdk/pipelines) is an in-process runtime workflow: typed stages run in the current process,
and your job system owns delivery, retries, and run retention. Durable execution persists the workflow
itself. Direct `agent.generate()`, `AgentTeam`, `Pipeline`, and agent memory do not become durable by being
called inside a durable run.

## What your application owns

- **Process lifetime:** keep one runtime alive at application scope, call `resume()` on startup, and await
  `runtime.close()` on shutdown under a process supervisor.
- **Authorization:** bind session IDs to tenant and conversation authorization; they are not authentication.
- **Tool recovery:** classify each tool as `manual`, `safe`, or `idempotent`, and reconcile runs that need
  attention. Idempotent tools must pass `context.operationId` to a service that deduplicates it.
- **Approvals:** decide every approval and uncertain external effect.
- **Storage:** the database holds prompts, responses, tool arguments, and results. Retention, encryption,
  backups, and access control are yours.
- **Deterministic code:** keep tool definitions, parsers, schemas, and approval predicates free of side
  effects where they are replayed.

## Go deeper

- [Durable execution](/sdk/advanced/durable-execution): run an agent durably and choose the right boundary
- [Runs, queues, and prompts](/sdk/advanced/durable-execution/runs): submissions, deduplication, and session queues
- [Progress events and streaming](/sdk/advanced/durable-execution/streaming): reconnect from snapshots without gaps
- [Tools, approvals, and recovery](/sdk/advanced/durable-execution/recovery): recovery policies and interrupted calls
- [Custom tasks](/sdk/advanced/durable-execution/tasks): dynamic subagents, timers, signals, and effects
- [Task graphs](/sdk/advanced/durable-execution/graphs): static dependency graphs of agent tasks
- [Production and operations](/sdk/advanced/durable-execution/production): hosting, storage failures, and workers
- [`@anvia/durable` package](/packages/durable): entry points, stores, and deployment roles
- [Pipelines](/sdk/pipelines): typed in-process workflows
