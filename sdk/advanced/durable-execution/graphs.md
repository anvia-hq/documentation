# Task graphs

`runtime.submitGraph()` persists a static directed acyclic graph of registered-agent tasks. Use it when the
1 to 100 nodes and their dependencies are known up front. For dynamic children, timers, or custom work use
[custom tasks](/sdk/advanced/durable-execution/tasks).

## 1. Submit a graph

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

```text
market  --\
           +--> report
product --/
```

The definition, child run IDs, and submission events commit in one transaction. A graph deduplicates by its
own `(sessionId, requestId)` scope. An identical definition returns the existing graph and a changed one
conflicts. Duplicate IDs, unknown agents or dependencies, and cycles are rejected before any work starts.
Prompts can include images and files.

## 2. Understand scheduling

- Independent roots run concurrently within `maxConcurrentRuns`.
- A dependent starts only when **every** prerequisite finished with a `response` outcome. A failed or
  cancelled prerequisite leaves its dependents waiting while independent branches continue. There is no
  skip or continue-on-error policy.
- Each task is an ordinary durable agent run in an isolated, generated session, so graph tasks do not append
  to the owning session's conversation.
- A node's input is its prompt followed by `Task dependency results (JSON):` and an object keyed by
  prerequisite task ID containing each full response output. The resolved input is persisted and reused on
  recovery.

## 3. Observe the graph

```ts
const snapshot = await graph.snapshot()
// nodes: { id, agentId, runId, status, wait?, output?, interaction?, error? }
// edges: { source, target }[]
// status: 'running' | 'waiting' | 'blocked' | 'completed' | 'cancelled'
for await (const event of graph.stream({ after: snapshot.cursor })) {
  // Events carry graphId, taskId, runId, and their sequence.
  render(await graph.snapshot())
}
```

Each node's `wait` explains why it is not running: `dependencies`, `dependency_failed`, `capacity`,
`interaction`, `retry`, or `recovery`. The graph is `running` while any node runs or is ready, `blocked` when
a node failed, was cancelled, or needs recovery, `waiting` for approvals and retry deadlines, and
`completed` only when every node has a successful response. The stream stays open while blocked or waiting and
ends on completion or cancellation. Events describe single run transitions, so refresh the atomic snapshot for
the graph-wide view.

## 4. Act on a node

Use a node's `runId` with the normal run APIs:

```ts
const node = snapshot.nodes.find((candidate) => candidate.wait?.type === 'interaction')
if (node?.interaction) {
  const run = await runtime.getRun(node.runId)
  await run.respond(node.interaction.id, { type: 'tool-approval', approved: true })
}
```

Resolving or retrying a prerequisite automatically makes its children eligible. `graph.cancel()` atomically
cancels unfinished tasks and records cancellation, then aborts active callbacks; it cannot undo completed
external effects, and cancelled graphs cannot be restarted.

After a restart call `runtime.resume()`. Completed outputs are reused, pending approvals stay pending, retry
deadlines stay scheduled, and uncertain effects still need an explicit decision. `runtime.getGraph(id)`
reacquires a handle and `runtime.listGraphs({ sessionId, after, limit })` pages summaries, at most 100 at a
time.

Editing a submitted graph, conditional edges, durable core `Pipeline` execution, and a Studio graph view are
not available.

Next: [production and operations](/sdk/advanced/durable-execution/production).
