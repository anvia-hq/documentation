# Durable execution

Durable execution lets an Anvia agent run survive a process restart. `@anvia/durable` stores submissions,
model responses, tool results, approvals, and progress events in SQLite, then reconstructs the agent loop
from those committed results instead of starting over.

::: warning Experimental
`@anvia/durable` is experimental. It supports **one runtime owner per local SQLite database** on a single
host and requires **Node.js 22.16 or newer**. It is not a distributed worker service. Database records may
change between releases.
:::

```sh
pnpm add @anvia/durable @anvia/core zod
```

```text
Application -> submit -> journal (SQLite) -> model/tool checkpoints -> outcome
                              ^ restart: resume() replays committed results
```

The runtime owns scheduling, session history, deduplication, and recovery. Your application owns the
process lifetime, authentication, storage location, and the decision for every approval or uncertain
external effect.

## 1. Run an agent durably

```ts
import { Agent } from '@anvia/core/agent'
import type { CompletionModel } from '@anvia/core/completion'
import { DurableRuntime } from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'

export async function openAssistant(model: CompletionModel, databasePath: string) {
  const assistant = new Agent({
    id: 'assistant',
    model,
    instructions: 'Answer from the supplied information. State uncertainty explicitly.',
  })

  const runtime = await DurableRuntime.open({
    store: new SqliteDurableStore(databasePath),
    agents: [{ agent: assistant, version: '1' }],
    onFatalError: (error) => console.error('Durable owner failed', error),
  })
  await runtime.resume() // reschedule unfinished work from the previous process
  return runtime
}

const run = await runtime.submit({
  agentId: 'assistant',
  sessionId: 'tenant-42:conversation-7',
  requestId: 'message-123', // reuse when the request is retried
  prompt: 'Summarize the incident notes.',
})
const outcome = await run.result()
```

Create the runtime once at application scope, keep it alive, and await `runtime.close()` at shutdown. Closing
aborts active attempts but keeps their checkpoints, so the next process continues them.

## 2. Choose the right boundary

| Need | API |
| --- | --- |
| One agent with conversation history | `runtime.submit()` returning a `DurableRun` |
| A fixed set of agent tasks with dependencies | `runtime.submitGraph()` |
| Dynamic subagents, timers, signals, or custom work | `defineTask()` and `runtime.submitTask()` |
| External work inside a task | `ctx.effect()` |
| A person's decision on an agent tool | `run.respond()` |
| An external callback for a task | `task.signal()` |

Direct `agent.generate()` and `agent.stream()`, `AgentTeam`, `Pipeline`, and agent memory do not become
durable by being called inside another function. Calling `agent.asTool()` wraps a nested call inside one outer
tool checkpoint, with no separate journal for its inner steps.

## 3. Understand what is replayed

Recovery is **operation-result replay**, not JavaScript stack restoration. Committed model responses and tool
results are reused and never executed again. Interrupted model requests may be sent again, and the provider
may bill both attempts. Interrupted tools follow their recovery policy, and a manual one waits for you. There
is no exactly-once guarantee for external services.

Registered code must therefore stay deterministic and side-effect free where it is replayed: tool
definitions, parsers, schemas, and approval predicates. Registration also rejects agent features that lack a
persistence boundary: memory, lifecycle callbacks, middleware, guardrails, context sources, MCP servers,
provider tools, and dynamic tool indexes.

## 4. Continue through the section

- [Runs, queues, and prompts](/sdk/advanced/durable-execution/runs)
- [Progress events and streaming](/sdk/advanced/durable-execution/streaming)
- [Tools, approvals, and recovery](/sdk/advanced/durable-execution/recovery)
- [Custom tasks and owned subagents](/sdk/advanced/durable-execution/tasks)
- [Task graphs](/sdk/advanced/durable-execution/graphs)
- [Production and operations](/sdk/advanced/durable-execution/production)

The [`@anvia/durable` package guide](/packages/durable) lists every entry point, and the
[API reference](/packages/durable/api-reference) lists signatures. Coding agents can load the bundled
`anvia-durable` skill with `pnpm dlx @anvia/cli skills init` (see [CLI](/packages/cli)).
