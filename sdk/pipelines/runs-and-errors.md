# Runs and errors

`run()` validates the input, executes stages in order, and resolves with the final output. Any
validation or stage failure rejects the run.

## 1. Trace Pipeline and Agent work together

Configure named Pipeline observers in the constructor. A Pipeline observer receives the root run and
every composed, parallel, Agent, extraction, and custom stage:

```ts
import { Agent, type CompletionModel } from '@anvia/core'
import type { AgentObserver } from '@anvia/core/observability'
import { Pipeline, type PipelineObserver } from '@anvia/core/pipeline'
import { z } from 'zod'

declare const model: CompletionModel
declare const agentObserver: AgentObserver
declare const pipelineObserver: PipelineObserver

const agent = new Agent({
  id: 'support',
  model,
  observability: {
    observers: { telemetry: agentObserver },
    primaryTrace: 'telemetry',
  },
})

const pipeline = new Pipeline({
  id: 'support-flow',
  inputSchema: z.string(),
  observability: {
    observers: { telemetry: pipelineObserver },
    primaryTrace: 'telemetry',
  },
}).agent({
  id: 'answer',
  agent,
  suspension: 'reject',
  request: ({ input }) => ({ prompt: input }),
})

const result = await pipeline.run({
  input: 'How long are refunds available?',
  trace: { sessionId: 'support-session' },
})

console.log(result.trace)
```

When the Pipeline and Agent use the same `primaryTrace` name, Core passes the Agent stage's trace ID
and observation ID into the Agent run. The backend can then export one trace with nested spans:

```text
Pipeline run
└─ Agent stage
   └─ Agent run
      ├─ Model generation
      └─ Tool call
```

The names identify which configured observers are compatible. If they differ, Core leaves the Agent
trace unchanged without raising an error. If the Agent request supplies a different `traceId`, that
explicit trace also wins.

Named observer failures are isolated by default. Set `observability.errorPolicy: 'throw'` when
telemetry delivery is required; the run then rejects with `PipelineObserverDispatchError` containing
the failed phase and per-observer failures.

## 2. Send stage events to one-run consumers

The `observer` passed to `run()` is a separate `PipelineRunObserver` event sink for Studio, logging,
or application-owned operational records:

```ts
const result = await pipeline.run({
  input,
  observer: {
    async onEvent(event) {
      await workflowEvents.append({
        type: event.type,
        nodeId: event.node.id,
        nodeLabel: event.node.label,
        durationMs: 'durationMs' in event ? event.durationMs : undefined,
      })
    },
  },
})
```

The sink receives `stage_started`, `stage_completed`, and `stage_failed`. Completed and failed events
include `durationMs`; failed events also include the error. Sink failures are isolated unless
`failOnObserverError: true` is passed to `run()`.

Use constructor-level `observability` for trace backends and the per-run `observer` for operational
stage events. They can be enabled together because they serve different consumers.

## 3. Inspect the graph

```ts
const pipeline = new Pipeline({
  id: 'ticket-triage',
  name: 'Ticket triage',
  inputSchema: z.string(),
})
  .step({
    id: 'normalize',
    name: 'Normalize ticket',
    run: ({ input: text }) => text.trim(),
  })
  .step({
    id: 'route',
    name: 'Route ticket',
    run: ({ input: text }) => ({ text, route: 'support' }),
  })

const graph = pipeline.graph()
```

The returned snapshot contains pipeline metadata, nodes, and edges. Node kinds include `input`, `step`, `pipeline`, `parallel`, `branch`, `agent`, `extractor`, and `output`.

The graph describes workflow structure, not a particular run's inputs, outputs, timing, or errors. Use observer events for runtime state.

## 4. Map failures at the runner

Input validation fails before the first stage. Later errors may come from steps, nested operations, parallel branches, agents, or extractors:

```ts
try {
  return await pipeline.run({ input })
} catch (error) {
  await workflowErrors.record(error)
  return { status: 'failed' }
}
```

Retry the narrow failing boundary when it is safe. Do not retry an entire pipeline after partial side effects unless those effects are idempotent, transactionally guarded, or keyed so repeats replace the same result.

For slow or durable work, run the pipeline in a [production worker](/sdk/pipelines/production-workers).
