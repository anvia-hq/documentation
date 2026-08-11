# Agent as a tool

`agent.asTool(...)` turns a built agent into a tool that another agent can call with a focused prompt.

## Build the specialist first

```ts
import { AgentBuilder } from '@anvia/core'

const policyAgent = new AgentBuilder('policy-review', policyModel)
  .instructions([
    'Review the supplied draft for policy risk.',
    'Return findings and recommended changes.',
    'Do not write the final customer response.',
  ].join('\n'))
  .defaultMaxTurns(2)
  .build()
```

A specialist should have a stable ID, narrow instructions, and only the tools or context required for its role. It may use a different completion model from the coordinator.

## Expose the specialist

```ts
const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft customer response for policy risk.',
  maxTurns: 2,
})
```

| Option | Purpose |
| --- | --- |
| `name` | Stable tool name the coordinator calls. |
| `description` | Explains exactly when and why to delegate. |
| `maxTurns` | Bounds the child agent's model-tool loop. |
| `stream` | Forwards child events into the parent stream when `true`. |

The generated tool accepts a prompt for the child. When called, Anvia runs the child agent and returns its final output as the tool result.

## Add it to a coordinator

```ts
const supportAgent = new AgentBuilder('support', coordinatorModel)
  .instructions([
    'Answer support questions.',
    'Use policy_review before sending a high-risk answer.',
    'Use the findings as evidence, then write the final answer yourself.',
  ].join('\n'))
  .tools([policyReview, ...supportTools])
  .defaultMaxTurns(6)
  .build()
```

The tool description and coordinator instructions should agree. A vague description makes delegation unpredictable; overlapping specialist descriptions make tool selection ambiguous.

## Keep the task self-contained

`asTool(...)` runs a stateless child prompt. The child does not automatically inherit the parent's conversation memory or session.

Tell the coordinator to pass the facts the child needs in the tool prompt. If the child truly needs durable memory, use an explicit session wrapper described in [Memory boundaries](/sdk/advanced/multi-agent/memory).

## Keep specialist tools narrow

Prefer read-only specialist agents for analysis, review, retrieval, and recommendations. If a child can perform side effects, every underlying tool must still enforce product permissions, validation, idempotency, and audit independently.
