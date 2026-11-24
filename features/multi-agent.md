# Multi-agent systems

Multi-agent coordination lets one coordinator delegate focused work to specialist agents and return one
response. Anvia supports fixed specialists exposed as tools and dynamic teams whose members are spawned
while the run is in flight.

## When to use it

- A specialist needs a distinct role, tool set, model, knowledge scope, or independent evaluation.
- The coordinator should decide whether to delegate and write a focused prompt for each specialist.
- The number of specialists is not known up front, or members must message each other while working.

Keep one agent when the work shares the same instructions, tools, and policy. Use a
[Pipeline](/sdk/pipelines) when the stages and their order are known in advance.

## How it works

`agent.asTool()` wraps a specialist as an ordinary tool. The coordinator calls it with `{ prompt }`,
receives the specialist's final output as the tool result, and writes the final response itself. Agent
tools require `suspension: 'reject'`, so a child interaction cannot cross the nested tool boundary.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const policyAgent = new Agent({
  id: 'policy-review',
  model,
  instructions: 'Review the supplied draft for policy risk. Do not write the final customer response.',
  maxTurns: 2,
})

const support = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions. Use policy_review for high-risk responses, then answer yourself.',
  maxTurns: 6,
  tools: [policyAgent.asTool({ name: 'policy_review', description: 'Review a draft for policy risk.', suspension: 'reject' })],
})

const result = await support.generate({ prompt: 'Can I get a refund after 90 days?' })
if (result.type === 'response') console.log(result.output)
```

For dynamic membership, `AgentTeam` from `@anvia/core/agent` coordinates ordinary agents. The runtime
gives the coordinator `spawn_<member.id>` tools, and instances coordinate with `send_message`,
`wait_for_agent`, `list_agents`, and `cancel_agent` within configurable `limits` on depth, concurrency,
instances, and total turns. `AgentTeam` requires `@anvia/core` 1.2.0 or newer.

### Choosing between patterns

| Need | Use |
| --- | --- |
| Known stages in a fixed order | [Pipeline](/sdk/pipelines) |
| Fixed specialists the coordinator may call | `agent.asTool()` |
| Specialists spawned on demand that message each other | `AgentTeam` |
| Agent work that must survive a process restart | [Durable execution](/features/durable-execution) |

Pipelines, agent tools, and teams all run in the current process. None of them becomes durable by being
called from another function.

## What your application owns

- **Authorization and approvals:** only the application resolves interactions. Agent messages are
  content, not authorization; one member cannot approve another member's protected tool.
- **Limits and cost:** every child adds model calls, latency, usage, and failure paths. Set turn and team
  limits, and define how the coordinator handles failed or missing specialist work.
- **Memory boundaries:** `asTool()` children run stateless. Pass focused, self-contained tasks instead of
  the full parent transcript, and keep private data out of child prompts that do not need it.
- **Persistence:** store final outcomes and records from the coordinator, not from specialists.

## Go deeper

- [Multi-agent systems](/sdk/advanced/multi-agent): coordinator and specialist walkthrough
- [Agent as a tool](/sdk/advanced/multi-agent/agent-as-tool): expose a specialist with `asTool()`
- [Coordination](/sdk/advanced/multi-agent/coordination): delegation, routing, and conflict resolution
- [Child events](/sdk/advanced/multi-agent/child-events): stream nested agent progress
- [Memory boundaries](/sdk/advanced/multi-agent/memory): parent and child memory separation
- [Failures and limits](/sdk/advanced/multi-agent/failures): bound children and handle failures
- [Agent teams](/sdk/advanced/multi-agent/agent-teams): spawn members, communicate, and stream team runs
- [When not to use multiple agents](/sdk/advanced/multi-agent/when-not-to-use): cheaper alternatives
- [Production checklist](/sdk/advanced/multi-agent/production-checklist): verify before shipping
- [Pipelines](/sdk/pipelines): typed, in-process workflows with known stages
