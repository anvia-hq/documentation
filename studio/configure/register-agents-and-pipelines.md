# Register agents and pipelines

The first argument to `Studio` is a list of runnable Anvia targets. Register the agents you want to exercise in the Playground and the pipelines you want to inspect in the pipeline workspace.

```ts
import { Studio } from '@anvia/studio'

new Studio([
  supportAgent,
  researchAgent,
  ticketPipeline,
]).start({ port: 4021 })
```

Studio accepts built `Agent` and `Pipeline` instances. It runs those same objects; registering a target does not create a second agent or pipeline definition.

## Register one agent

Give the agent a stable ID and useful display metadata when you build it:

```ts
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supportAgent = new Agent({
  id: 'support-operations',
  model: openai.completionModel({
      modelId: 'gpt-5.6-luna',
      api: "responses"
  }),
  name: 'Support operations',
  description: 'Investigates tickets and recommends the next action.',
  instructions: 'Use available evidence and keep recommendations concise.',
  maxTurns: 4,
})

new Studio([supportAgent]).start()
```

Studio uses the agent's `id` as its runtime identifier. The name and description become browser labels. Studio also derives inspection metadata from the live agent, including context, dynamic-tool, observer, approval-tool, lifecycle, output-schema, and turn-limit information.

That derived metadata describes the registered runtime. It does not contain the agent's instructions, provider credentials, or business data.

## Register several agents

Agents in the same Studio process share one development workspace but keep their own configuration:

```ts
new Studio([
  supportAgent,
  engineeringAgent,
  customerCommsAgent,
]).start()
```

The selected agent controls agent-aware views such as the Playground, Tools, Knowledge, and Memory. Switching the selection does not rebuild or mutate any agent.

Use [quick prompts](/studio/configure/quick-prompts) when each agent needs its own ready-to-run examples.

## Register pipelines

Pass a built pipeline in the same target list:

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { Studio } from '@anvia/studio';
import { z } from 'zod';
const ticketPipeline = new Pipeline({
    id: 'ticket-triage-pipeline',
    name: 'Ticket triage',
    description: 'Normalizes a ticket and prepares a routing decision.',
    inputSchema: z.string(),
    metadata: {
        owner: 'support-operations',
        sampleInput: 'Enterprise customer reports a checkout outage.',
    },
})
    .step({
    id: "step-1",
    name: 'Normalize ticket',
    run: ({ input: ticket }) => ticket.trim()
})
    .step({
    id: "step-2",
    name: 'Classify priority',
    run: ({ input: ticket }) => ({
        ticket,
        priority: ticket.toLowerCase().includes('outage') ? 'high' : 'normal',
    })
});
new Studio([supportAgent, ticketPipeline]).start();

```

Studio preserves the pipeline's name, description, and JSON-compatible metadata. Its stable ID is used by the graph, run, log, and replay routes. Pipeline metadata such as an owner or sample input is useful for explaining the workflow in the inspector.

Learn how to read the registered workflow in [Pipelines](/studio/pipelines).

## How IDs are inferred

Studio derives IDs from the targets in constructor order:

| Target | Inferred Studio ID |
| --- | --- |
| Agent | The agent's `id`. |
| Pipeline | The pipeline's `id`, or `pipeline` if its ID is empty. |

Duplicate IDs of the same target type receive an incrementing suffix:

```ts
new Studio([
  firstSupportAgent,  // support
  secondSupportAgent, // support-2
  thirdSupportAgent,  // support-3
])
```

Agents and pipelines are normalized separately, so an agent and a pipeline may use the same text ID without colliding: their HTTP routes and Studio views are different. Within each type, prefer unique IDs in the source definition instead of relying on suffixes. Stable IDs make saved sessions, model policies, quick prompts, pipeline runs, and URLs easier to reason about.

::: tip Configuration follows the final ID
Agent-specific options use the ID after duplicate handling. For example, prompts for the second `support` agent belong under `support-2`, not `support`.
:::

## Choose what belongs in one Studio process

Group targets that developers need to inspect together. A support workspace might contain several support agents and their routing pipelines; an unrelated ingestion system can run in a separate Studio process.

Keeping the target list focused makes agent selection and pipeline history easier to navigate. It also keeps provider credentials and external dependencies scoped to the process that needs them.

Continue with [Quick prompts](/studio/configure/quick-prompts), or inspect the resulting registry in [Agents](/studio/agents).
