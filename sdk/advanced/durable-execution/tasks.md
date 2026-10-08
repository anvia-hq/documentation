# Custom tasks and owned subagents

Use a custom task when the workflow itself must be durable: dynamic planning, spawning agent or custom
children, joining results, waiting on timers or external signals, and performing side effects.

A task handler does not restore JavaScript stacks. It runs one **phase** at a time, from a committed
checkpoint, and returns the next transition.

## 1. Define a task

```ts
import { z } from 'zod'
import { defineTask } from '@anvia/durable'

const increment = defineTask({
  name: 'increment',
  version: 1,
  input: z.number(),
  checkpoint: z.null(),
  output: z.number(),
  initial: () => null,
  run: async ({ input }) => ({ status: 'completed', output: input + 1 }),
})
```

Schemas must round-trip their own JSON output unchanged, so dates, maps, classes, and value-changing
transforms are rejected. Register tasks when opening the runtime, then submit:

```ts
const runtime = await DurableRuntime.open({
  store: new SqliteDurableStore('./tasks.sqlite'),
  tasks: [increment],
  agents,
  maxConcurrentTasks: 4,
})
await runtime.resume()
const task = await runtime.submitTask(increment, {
  sessionId: 'account-42',
  requestId: 'increment-1',
  input: 10,
})
await task.result() // 11
```

A repeated root submission with the same session, request ID, name, version, and input returns the original
task.

## 2. Orchestrate owned agents

Two parallel researchers, each an owned agent run with isolated session history, joined by a parent task:

```ts
const research = defineTask({
  name: 'research-report',
  version: 1,
  input: z.object({ topic: z.string().min(1) }),
  checkpoint: z.discriminatedUnion('phase', [
    z.object({ phase: z.literal('plan') }),
    z.object({ phase: z.literal('write'), researcherIds: z.array(z.string()) }),
  ]),
  output: z.string(),
  initial: () => ({ phase: 'plan' as const }),
  run: async (ctx) => {
    if (ctx.checkpoint.phase === 'plan') {
      const ids = ['market', 'product'].map((question) =>
        ctx.spawnAgent(`research-${question}`, {
          agentId: 'researcher',
          prompt: JSON.stringify({ topic: ctx.input.topic, question }),
        }),
      )
      return {
        status: 'waiting',
        checkpoint: { phase: 'write' as const, researcherIds: ids },
        wait: { type: 'children', ids, policy: 'failFast' },
      }
    }
    const findings: string[] = []
    for (const child of ctx.children()) {
      if (child.outcome?.status !== 'completed' || typeof child.outcome.output !== 'string')
        return { status: 'failed', error: 'A researcher did not succeed.' }
      findings.push(child.outcome.output)
    }
    return { status: 'completed', output: findings.join('\n\n') }
  },
})
```

`ctx.spawnAgent(key, { agentId, prompt })` returns a **task ID**. Creation of the child task and its agent run
is atomic and happens before the parent's next checkpoint commits. The key belongs to the parent for its whole
lifetime: replaying the same key and input returns the same child, while changing the input conflicts. Derive
keys from stable data (an index in a saved plan), never `Date.now()` or random IDs, and include an iteration
ID for repeated work. Register `agents` and any custom child definitions at `open()`.

When a model chooses the plan, run the planner as an owned agent and validate its saved JSON output in task
code before spawning workers. Do not capture `ctx` in long-lived closures or let a model choose task names or
unvalidated prompts.

## 3. Join children

A task waits only on distinct direct children. `allSettled` resumes after every child is terminal. `failFast`
marks unfinished selected siblings for cancellation after the first failure, then resumes once they settle.
Neither decides the parent's outcome; read `ctx.children()` and decide. Never block a phase with
`await handle.result()` or an in-memory timer: return a `waiting` transition so capacity is released and the
wait survives restart. A parent whose children are unfinished stays in `completing` or `cancelling` until they
settle. Trees are limited to 1000 nodes and depth 32, and there are no detached children.

## 4. Journal external effects

```ts
const receipt = await ctx.effect(
  'charge-order-42', // stable for this logical action across every replay
  { orderId: '42', amount: 100 }, // all arguments that determine the action
  async (operationId, signal) =>
    payments.charge({ orderId: '42', amount: 100, idempotencyKey: operationId, signal }),
  'idempotent',
)
```

The engine commits intent before the callback and the JSON result after it. Completed results are reused, and
changing saved input or policy blocks replay. Policies match tools: `manual` (default), `safe`, and
`idempotent` (same `${taskId}/${key}` operation ID). For a task in `needs_attention`, inspect
`(await task.snapshot()).operations`, verify the real result, then:

```ts
await task.resolveEffect('charge-order-42', { receiptId: 'verified-receipt-id' })
```

Await every effect before returning from a phase. A non-JSON or oversized effect result also blocks for
reconciliation, and an ordinary exception fails the phase without proving the action did not happen.

## 5. Wait on timers and signals

```ts
return {
  status: 'waiting',
  checkpoint: { phase: 'review' as const },
  wait: { type: 'signal', name: 'review-1' },
}
// Later, in the continuation:
const decision = ctx.signalValue('review-1') // undefined means not delivered
// From your application, after authorizing the delivery:
await task.signal('review-1', 'delivery-123', { approved: true })
```

Each signal name accepts one value for the task's lifetime, including early delivery. An identical request is
idempotent and a different value conflicts. Use a new name for another round, and test `=== undefined`, not
truthiness. A timer is `wait: { type: 'timer', until: isoTimestamp }`; derive `until` from persisted input so
replay produces the same deadline. Timers survive restart but are not execution deadlines.

## 6. Inspect, cancel, and migrate

- `task.graph()` and `runtime.taskGraph(id)` return the bounded ownership tree with `owns` and `waits` edges
  and a cursor. `task.stream({ after })` streams committed changes, including later children.
- To approve or reconcile an owned agent, read the child record's `agentRunId`, then use
  `runtime.getRun(agentRunId)` with `respond()` or `resolveTool()`. The task ID is not the run ID. Streaming
  deltas and model or tool events live on that run's stream, not on the task-tree stream.
- `task.cancel()` fences the subtree and cancels owned agents, but cannot undo external effects. Terminal
  outcomes are immutable, and `task.retry()` only resumes `needs_attention` tasks.
- Versions are positive integers. A newer definition needs a pure `migrate(input, checkpoint, fromVersion)`.
  A missing or older definition blocks the task until compatible code is restored.

Next: [task graphs](/sdk/advanced/durable-execution/graphs).
