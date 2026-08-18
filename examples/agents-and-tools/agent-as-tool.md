# Agent as a tool

A coordinator can delegate a bounded task to a specialist through an ordinary tool call. Use this when the coordinator should decide which expertise a request needs.

```ts
import { Agent } from '@anvia/core'

const support = new Agent({
  id: 'support',
  model,
  name: 'Support specialist',
  description: 'Analyze customer impact and the next support action.',
  instructions: 'Use supplied facts only. Return concise bullets.',
})

const engineering = new Agent({
  id: 'engineering',
  model,
  name: 'Engineering specialist',
  description: 'Propose diagnostics and the safest technical next step.',
  instructions: 'Separate facts from hypotheses. Return concise bullets.',
})

const coordinator = new Agent({
  id: 'coordinator',
  model,
  instructions: 'Delegate specialist analysis, then synthesize one incident brief.',
  maxTurns: 4,
  tools: [
    support.asTool({ name: 'ask_support', suspension: 'reject' }),
    engineering.asTool({ name: 'ask_engineering', suspension: 'reject' }),
  ],
})

const result = await coordinator.generate({
    prompt: 'Webhook retries failed for large payloads. Prepare an incident brief.',
    toolConcurrency: 2
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

Each generated tool accepts a delegated prompt. The child agent's completed output becomes its tool result, and the coordinator can synthesize that result on a later turn. `suspension: 'reject'` makes the nested boundary explicit: an approval or question inside the child fails that delegated tool call instead of trying to suspend the parent. Delegation is model-driven, so the exact specialists called can vary.

Agent-as-tool increases latency, token use, and failure surface. It does not create a security boundary: give each specialist only the context and tools it needs, validate tenant propagation, and prevent recursive delegation with strict limits.

Use a [parallel pipeline](./parallel-agents) when every specialist must run deterministically.
