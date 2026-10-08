# Tools, approvals, and recovery

A durable run commits an intent before each model request or approved tool call, then commits the normalized
result with its event. This page covers what happens when the process stops in between.

## 1. Classify every tool

Tools default to `manual`. Declare a policy per tool name on the registration. Every named tool must exist on
that agent.

```ts
agents: [
  {
    agent: assistant,
    version: '1',
    toolRecovery: { search: 'safe', create_ticket: 'idempotent' },
  },
]
```

| Policy | If interrupted after the intent committed |
| --- | --- |
| `manual` | Run becomes `needs_attention`. Nothing repeats until you reconcile it. |
| `safe` | The call runs again. Use for reads and pure work where repetition is acceptable. |
| `idempotent` | The call runs again with the same `operationId`. The service must deduplicate it. |

A committed tool result is reused under every policy. Choosing `idempotent` does not make an API safe: the
tool must pass `context.operationId` to a service that actually enforces deduplication.

```ts
import { createTool } from '@anvia/core/tool'
import { z } from 'zod'

const createTicket = createTool({
  name: 'create_ticket',
  description: 'Create a ticket for the requested work.',
  inputSchema: z.object({ title: z.string().min(1) }),
  outputSchema: z.object({ ticketId: z.string() }),
  requiresApproval: true,
  execute: async ({ title }, context) => {
    if (context.operationId === undefined) throw new Error('Requires durable execution.')
    return tickets.create({ title, idempotencyKey: context.operationId, signal: context.abortSignal })
  },
})
```

`context.operationId` is the full stable external key (run ID plus checkpoint key). The event
`operationId` and snapshot `blockedOperation` are run-local keys used only for inspection and
reconciliation.

## 2. Reconcile an uncertain tool

The ambiguous interval is an external action that succeeded before its result committed. Inspect the real
outcome in the external system, then supply it:

```ts
const run = await runtime.getRun(runId)
const { run: saved } = await run.snapshot()
if (saved.status === 'needs_attention' && saved.blockedOperation) {
  // Verify the ticket exists before supplying its result.
  await run.resolveTool(saved.blockedOperation, {
    type: 'json',
    value: { ticketId: 'verified-ticket-id' },
  })
}
```

Never manufacture a receipt to unblock work. If the outcome is still unknown, leave the run blocked.

## 3. Respond to approvals and questions

Tools with `requiresApproval` and question tools use core's interaction protocol. A waiting run exposes the
interaction in its outcome:

```ts
const { run: saved } = await run.snapshot()
if (saved.status === 'waiting' && saved.outcome?.type === 'interaction') {
  const interaction = saved.outcome.interaction
  if (interaction.type === 'tool-approval') {
    // Obtain and authorize the person's real decision first.
    await run.respond(interaction.id, { type: 'tool-approval', approved })
  }
}
```

Responses are validated and persisted atomically with the continuation transition. Repeating the same
response is harmless and a conflicting one fails. Restarting, streaming, or awaiting `result()` never approves
work, and reopening the runtime neither discards a pending interaction nor runs its tool early.

## 4. Retry failed or blocked runs

`run.retry()` reattempts a failed or blocked run under the same recovery checks. It does not override manual
recovery, is rejected once a later submission has advanced the session, and resets the attempt counters of
unfinished model operations while keeping completed results.

For transient model failures opt in to persisted backoff on the registration:

```ts
{ agent: assistant, version: '1', modelRetry: { maxAttempts: 3, initialDelayMs: 1000, maxDelayMs: 30_000 } }
```

It retries errors thrown within the core completion attempt, including permanent provider and validation
errors, and counts crashed attempts. Observer, post-processing, checkpoint, quota, turn-budget, and tool
failures are not retried. The run waits in `retry_wait` with a `nextAttemptAt` deadline that survives restart.

## 5. Keep versions compatible

Recovery compares saved operation inputs with freshly constructed ones. If the registered version is missing
or code changed incompatibly, the run enters `needs_attention` without calling a model or tool. Bump
`version` when the model, instructions, tools, schemas, or approval logic change, restore the original version
to finish blocked old work, then call `retry()`.

## 6. Add and remove agents at runtime

```ts
runtime.registerAgents([{ agent: reviewer, version: '1' }])
const removed = runtime.unregisterAgent('reviewer') // false if it was not registered
```

`registerAgents` validates the whole batch first and never replaces an existing ID. `unregisterAgent` throws
`DurableConflictError` while any run, queued work, approval, retry wait, recovery block, or settling attempt
still needs the agent. History and deduplication records are preserved. At startup, open without agents,
discover unfinished runs with `listRuns()`, restore their exact registrations, then call `resume()`.
Registering a missing agent does not retry `needs_attention` runs by itself.

Next: [custom tasks and owned subagents](/sdk/advanced/durable-execution/tasks).
