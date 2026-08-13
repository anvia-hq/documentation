# Multi-agent systems

Multi-agent systems let one agent delegate focused work to specialist agents. In Anvia, the simplest pattern is to expose each specialist with `agent.asTool(...)` and give those tools to one coordinator.

## Explore multi-agent systems

| Page | Learn how to |
| --- | --- |
| [Agent as a tool](/sdk/advanced/multi-agent/agent-as-tool) | Expose a specialist agent to a coordinator. |
| [Child events](/sdk/advanced/multi-agent/child-events) | Stream nested work without leaking private runtime data. |
| [Memory boundaries](/sdk/advanced/multi-agent/memory) | Keep children stateless or give them an explicit session. |
| [Coordination](/sdk/advanced/multi-agent/coordination) | Make one parent own delegation and the final answer. |
| [Failures and limits](/sdk/advanced/multi-agent/failures) | Bound child turns and handle nested failures. |
| [When not to use](/sdk/advanced/multi-agent/when-not-to-use) | Avoid unnecessary agents and model calls. |
| [Production checklist](/sdk/advanced/multi-agent/production-checklist) | Verify permissions, observability, and product ownership. |

## The basic shape

```text
User request
    ↓
Coordinator ──→ policy specialist
    │          technical specialist
    │          research specialist
    ↓
One final answer
```

The coordinator decides whether to delegate, supplies a focused task, receives each child output as a tool result, and writes the final user-facing response.

## Create one specialist

```ts
import { Agent } from '@anvia/core'

const policyAgent = new Agent({
  id: 'policy-review',
  model: model,
  instructions: 'Review the supplied draft for policy risk. Return concise findings, not a user-facing answer.',
  maxTurns: 2,
})

const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft support answer for policy risk.',
  maxTurns: 2,
})
```

Add the specialist tool to the coordinator:

```ts
const supportAgent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Answer support questions. Use policy_review for high-risk answers, then write the final response yourself.',
  maxTurns: 6,
  tools: [policyReview, ...supportTools],
})
```

## Use meaningful boundaries

Split out a specialist when it has a distinct role, tool set, model, output contract, or reason to be tested independently. Keep one agent when the work uses the same instructions, tools, and policy throughout.

More agents create more model calls, latency, traces, and failure modes. The boundary should make the system easier to control—not merely look more sophisticated.
