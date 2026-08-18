# Multi-agent systems

A multi-agent system lets one coordinator delegate focused work to specialist agents. The simplest Anvia pattern exposes each specialist with `agent.asTool()`.

```text
User request
    -> coordinator
         -> policy specialist
         -> technical specialist
         -> research specialist
    -> one coordinator response
```

The coordinator chooses whether to delegate, writes a focused child prompt, receives the child output as a tool result, and owns the final response.

## 1. Create a specialist tool

```ts
import { Agent } from '@anvia/core'

const policyAgent = new Agent({
  id: 'policy-review',
  model: policyModel,
  instructions: [
    'Review the supplied draft for policy risk.',
    'Return concise findings and recommended changes.',
    'Do not write the final customer response.',
  ].join('\n'),
  maxTurns: 2,
})

const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft support response for policy risk.',
  maxTurns: 2,
  suspension: 'reject',
})
```

## 2. Give it to the coordinator

```ts
const supportAgent = new Agent({
  id: 'support',
  model: coordinatorModel,
  instructions: [
    'Answer support questions.',
    'Use policy_review for high-risk responses.',
    'Use its findings as evidence, then write the final response yourself.',
  ].join('\n'),
  maxTurns: 6,
  tools: [policyReview, ...supportTools],
})

const result = await supportAgent.generate({
    prompt: question
})
```

The generated tool accepts `{ prompt: string }` and returns the child's final output string. Agent tools require an explicit suspension policy; `reject` prevents a child interaction from crossing the nested tool boundary.

## 3. Use a meaningful boundary

Create a specialist when it has a distinct role, tool set, model, knowledge scope, output expectation, or reason to be evaluated independently.

Keep one agent when the work shares the same instructions, tools, and policy. Each child adds model calls, latency, usage, traces, and failure paths.

## 4. Continue through the section

- [Expose an agent as a tool](/sdk/advanced/multi-agent/agent-as-tool)
- [Stream child events](/sdk/advanced/multi-agent/child-events)
- [Define memory boundaries](/sdk/advanced/multi-agent/memory)
- [Coordinate specialist work](/sdk/advanced/multi-agent/coordination)
- [Handle failures and limits](/sdk/advanced/multi-agent/failures)
- [Know when not to use multiple agents](/sdk/advanced/multi-agent/when-not-to-use)
- [Review the production checklist](/sdk/advanced/multi-agent/production-checklist)
