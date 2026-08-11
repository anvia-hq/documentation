# Runs and errors

`run(...)` resolves the final stage output and forwards validation or stage failures to the caller.

## Observe a run

```ts
const result = await pipeline.run(input, {
  observer: {
    async onEvent(event) {
      await workflowEvents.append({
        type: event.type,
        nodeId: event.node.id,
        nodeLabel: event.node.label,
        durationMs:
          'durationMs' in event ? event.durationMs : undefined,
      })
    },
  },
})
```

Observers receive `stage_started`, `stage_completed`, and `stage_failed`. Completed and failed events include duration. Observer errors also reject the run.

Use agent observers for model and tool activity inside an agent stage. Use pipeline observers for workflow-stage status.

## Inspect the graph

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const pipeline = new PipelineBuilder(z.string(), {
  id: 'ticket_triage',
  name: 'Ticket triage',
})
  .step((text) => text.trim(), {
    id: 'normalize',
    name: 'Normalize ticket',
  })
  .step((text) => ({ text, route: 'support' }), {
    id: 'route',
    name: 'Route ticket',
  })
  .build()

const graph = pipeline.graph()
console.log(graph)
```

The result is:

```json
{
  "id": "ticket_triage",
  "name": "Ticket triage",
  "nodes": [
    { "id": "input", "kind": "input", "label": "Input" },
    { "id": "normalize", "kind": "step", "label": "Normalize ticket" },
    { "id": "route", "kind": "step", "label": "Route ticket" },
    { "id": "output", "kind": "output", "label": "Output" }
  ],
  "edges": [
    { "id": "edge_1", "source": "input", "target": "normalize" },
    { "id": "edge_2", "source": "normalize", "target": "route" },
    { "id": "edge_3", "source": "route", "target": "output" }
  ]
}
```

The graph describes input, step, nested pipeline, parallel, agent, extractor, and output nodes. It contains workflow metadata—not a run's values or result.

## Map failures at the runner

Input validation throws before the first stage. Later errors come from steps, nested pipelines, agents, or extractors.

```ts
try {
  return await pipeline.run(input)
} catch (error) {
  await workflowErrors.record(error)
  return { status: 'failed' }
}
```

Retry the narrow failing boundary when it is safe. Do not retry an entire pipeline after partial side effects unless those effects are idempotent or transactionally guarded.
