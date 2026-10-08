# Tasks and graphs

Durable has two ways to coordinate more than one agent run: a **static task graph** for dependencies known
up front, and **custom tasks** for dynamic children, timers, signals, and external effects. Both are
experimental and run in the same single-owner runtime.

## Static task graphs

`runtime.submitGraph()` persists a static DAG of registered-agent tasks. The graph definition, child run IDs,
node submissions, and their events commit in one transaction. A graph has its own `(sessionId, requestId)`
deduplication scope, separate from ordinary submissions: an identical definition returns the existing graph
and a changed one under the same key fails.

```ts
const graph = await runtime.submitGraph({
  sessionId: 'research-project',
  requestId: 'report-42',
  tasks: [
    { id: 'market', agentId: 'researcher', prompt: 'Research the market.' },
    { id: 'product', agentId: 'researcher', prompt: 'Research the product.' },
    {
      id: 'report',
      agentId: 'writer',
      prompt: 'Synthesize the dependency results.',
      dependsOn: ['market', 'product'],
    },
  ],
})
```

A graph has 1 to 100 tasks with stable alphanumeric, dash, or underscore IDs. Duplicate IDs, unknown agents or
dependencies, and cycles are rejected before work starts. Independent roots run concurrently within
`maxConcurrentRuns`. A dependent becomes eligible only after every prerequisite commits a `response` outcome;
a failed or cancelled prerequisite, or a non-response outcome, does not release it. Independent branches
continue. There is no implicit skip or continue-on-error policy.

Each task is an ordinary durable agent run in a generated, reserved session, which isolates branch histories
and allows parallel work; graph tasks do not append to the owning session's conversation. On first
activation a node receives its prompt followed by `Task dependency results (JSON):` and a JSON object keyed
by prerequisite task ID with each full response output. That resolved input is persisted and reused on
recovery. Media parts in prompts are preserved.

### Inspect and observe

```ts
const snapshot = await graph.snapshot()
// snapshot.nodes: { id, agentId, runId, status, wait?, output?, interaction?, error? }
// snapshot.edges: { source, target }[]
// snapshot.status: 'running' | 'waiting' | 'blocked' | 'completed' | 'cancelled'
for await (const event of graph.stream({ after: snapshot.cursor })) {
  // Each event carries graphId, taskId, runId, and its global sequence.
  render(await graph.snapshot())
}
```

A node's `status` is its run status. Its `wait` explains why it cannot run:

| Wait type | Meaning | Resumes by |
| --- | --- | --- |
| `dependencies` | Direct prerequisites have not succeeded. | Their success, automatically. |
| `dependency_failed` | A prerequisite failed, was cancelled, or was not a response. | A successful retry, or a new graph. |
| `capacity` | Ready, waiting for an execution slot. | Capacity, automatically. |
| `interaction` | Approval or question pending. | An explicit `run.respond()`. |
| `retry` | Persisted model retry deadline. | The deadline, while the host is alive. |
| `recovery` | Version mismatch or uncertain tool effect. | Restoring compatible code and retrying, or reconciling the tool. |

Graph status is `running` while a task runs or is ready; otherwise `blocked` when a task failed, was cancelled,
or needs recovery, and `waiting` for interactions or retry deadlines. `completed` requires every task to have
a successful response. A graph stream stays open while blocked or waiting and ends on completion or graph
cancellation; its events describe run transitions, so refresh the snapshot for the graph-wide view.

Use `snapshot.nodes[i].runId` with `runtime.getRun()` and the existing `respond`, `retry`, `resolveTool`, and
`cancel` methods. `graph.cancel()` atomically cancels unfinished tasks and records cancellation, then aborts
active callbacks; it cannot undo external effects, and cancelled graphs cannot be restarted. After a restart,
`runtime.resume()` rediscovers eligible nodes; completed outputs are reused, approvals stay pending, and
uncertain effects still need explicit decisions.

`runtime.getGraph(id)` returns a handle, and `runtime.listGraphs({ sessionId, after, limit })` pages
insertion-ordered summaries, at most 100 per page. Graph cursors are separate from event cursors. Graph child
runs use isolated sessions and are discovered through the graph, not `listRuns({ sessionId })`.

## Custom tasks

`defineTask()` creates a versioned, schema-validated task. Register it in `DurableRuntime.open({ tasks })`,
then call `runtime.submitTask()`. Schemas must accept their own JSON output unchanged: non-JSON values and
schema transforms that change a persisted value on revalidation are rejected. Initializers and migrations
must be pure.

```ts
import { z } from 'zod'
import { defineTask, DurableRuntime } from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'

const increment = defineTask({
  name: 'increment',
  version: 1,
  input: z.number(),
  checkpoint: z.null(),
  output: z.number(),
  initial: () => null,
  run: async ({ input }) => ({ status: 'completed', output: input + 1 }),
})

const runtime = await DurableRuntime.open({
  store: new SqliteDurableStore('./tasks.sqlite'),
  tasks: [increment],
  maxConcurrentTasks: 4,
})
await runtime.resume()
const task = await runtime.submitTask(increment, {
  sessionId: 'account-42',
  requestId: 'increment-1',
  input: 10,
})
const result = await task.result() // 11
```

A root submission with the same session ID, request ID, task name, version, and normalized input returns the
original task; conflicting reuse fails. Tasks in one session can run concurrently and share no conversation
history. `runtime.getTask(id)` reacquires a handle (output typed as JSON), and
`runtime.listTasks({ sessionId, after, limit })` pages root records, up to 100 per page.

### Transitions

A handler runs one phase and returns one transition:

| Transition | Meaning |
| --- | --- |
| `{ status: 'pending', checkpoint }` | Commit the next phase and release the slot. |
| `{ status: 'waiting', checkpoint, wait }` | Commit a continuation and park the task. |
| `{ status: 'completed', output }` | Validate and record the intended result. |
| `{ status: 'failed' \| 'cancelled', error }` | Record the outcome and cancel unfinished owned children. |

If the process dies before a transition commits, the handler re-enters with its previous checkpoint, so phases
must be replayable. External work belongs in `ctx.effect()`.

### Children and joins

`ctx.spawn(key, definition, input)` creates a custom child and `ctx.spawnAgent(key, { agentId, prompt })`
creates an owned agent child; both return the child's **task ID**. Creation commits atomically with its
submission event before returning. A key belongs to its parent for the parent's whole lifetime: replaying the
same spawn reuses the child, while changing its name, version, or input conflicts. Include an iteration ID in
keys for repeated work.

```ts
const sum = defineTask({
  name: 'sum',
  version: 1,
  input: z.array(z.number()),
  checkpoint: z.enum(['spawn', 'sum']),
  output: z.number(),
  initial: () => 'spawn' as const,
  run: async (ctx) => {
    if (ctx.checkpoint === 'spawn') {
      const ids = ctx.input.map((value, index) => ctx.spawn(`item-${index}`, increment, value))
      return {
        status: 'waiting',
        checkpoint: 'sum' as const,
        wait: { type: 'children', ids, policy: 'allSettled' },
      }
    }
    let output = 0
    for (const child of ctx.children()) {
      if (child.outcome?.status !== 'completed') {
        return { status: 'failed', error: 'A child did not complete successfully.' }
      }
      output += Number(child.outcome.output)
    }
    return { status: 'completed', output }
  },
})
```

Register both `sum` and `increment` in `tasks`. A task waits only on distinct direct children, which prevents
cycles. Trees are limited to 1000 nodes and depth 32; exceeding either fails creation without partially
inserting the child. There are no detached children. `allSettled` resumes the parent when every selected child
is terminal; `failFast` marks unfinished selected siblings for cancellation after the first failure or
cancellation and resumes after they settle. The handler decides its own outcome from `ctx.children()`.

A successful parent with unfinished children enters `completing`, and a failed or cancelled parent enters
`cancelling`. Neither becomes terminal until all owned work and callbacks settle, and neither holds phase
capacity. Terminal outcomes are immutable: `task.retry()` only resumes `needs_attention` tasks after
compatible code is restored.

### Owned agents

Agents registered in `agents` can be spawned as children. Creating the task and its agent run is atomic, each
owned agent gets isolated session history and its own run ID, and the custom task slot is released while it
works. Agent concurrency, checkpoints, approvals, retry backoff, and manual recovery keep their usual
semantics. A successful response becomes the child's JSON output; a failed, cancelled, or non-response run
becomes an unsuccessful outcome.

The child record exposes `agentRunId`. Use `runtime.getRun(agentRunId)` for `respond()` and `resolveTool()`
and for model, tool, and streaming-delta events; the task-tree stream carries only task submission and status
changes. Cancelling the task tree cancels owned agents, and cancelling an agent run settles its child task.
Once the child outcome is decided, the owned run cannot be retried independently.

### Effects

```ts
const receipt = await ctx.effect(
  'charge-order-42',
  { orderId: '42', amount: 100 },
  async (operationId, signal) => {
    return await payments.charge({ orderId: '42', amount: 100, idempotencyKey: operationId, signal })
  },
  'idempotent',
)
```

The engine commits intent before the callback and the JSON result after it. Completed results are reused.
Keys are scoped to the task's whole lifetime, and changing saved input or policy blocks replay. Await every
effect before returning. The policy is `manual` (default; interrupted intent needs reconciliation), `safe`
(may run again), or `idempotent` (reruns with the same `${taskId}/${key}` operation ID; the service must
deduplicate). For a `needs_attention` task, inspect `(await task.snapshot()).operations`, verify the actual result,
then call `task.resolveEffect(key, verifiedJsonResult)`. A non-JSON or oversized result also blocks for
reconciliation. An ordinary exception fails the phase, which does not prove the external action failed.

### Timers and signals

```ts
return {
  status: 'waiting',
  checkpoint: nextCheckpoint,
  wait: { type: 'timer', until: new Date(Date.now() + 60_000).toISOString() },
}
```

Timer deadlines survive restart and release capacity while parked; the host process must still be running.
A signal wait is `{ type: 'signal', name: 'review-decision' }`, delivered with
`await task.signal('review-decision', 'delivery-123', { approved: true })` and read by the continuation with
`ctx.signalValue('review-decision')`. Each name accepts one value for the task's lifetime, including early
delivery, an identical request and value is idempotent, and a different one conflicts. A task allows at most
1000 signals; names are nonblank, trimmed, at most 256 characters, and not `__proto__`.

### Inspection, cancellation, and versions

`task.graph()` and `runtime.taskGraph(id)` return the complete bounded ownership tree (`owns` and `waits`
edges) plus a cursor. `task.stream({ after })` streams committed changes for the whole tree, including later
children; a child handle observes the whole root tree. `task.cancel()` fences the subtree against new work and
aborts invocations; `cancel({ expectedTreeIds })` fails if the tree changed. Callbacks must honor abort
signals.

Definition versions are positive integers. A missing or older definition blocks the task when it becomes
runnable; a newer one needs a pure `migrate(input, checkpoint, fromVersion)` returning values accepted by the
current schemas. Restore compatible code and call `retry()` for an already blocked task. A registered task can
also be submitted by name with `runtime.submitRegisteredTask()`, the same boundary the HTTP handler uses.

See [HTTP server and client](/packages/durable/http) for remote controls.
