# Agent as tool

**Type:** Pattern

## Outcome

Let a coordinator delegate a bounded task to a specialist agent through an ordinary tool call. Use
this when specialists need distinct instructions or capabilities and a coordinator must decide when
to invoke them.

## Prerequisites

- A provider completion model
- Clear specialist responsibilities with non-overlapping descriptions
- A bounded turn and tool policy for both parent and child agents

## Specialist and coordinator

```ts
import { Agent } from '@anvia/core/agent'

const support = new Agent({
  id: 'support',
  model: model,
  name: 'Support specialist',
  description: 'Analyze customer impact and the next support action.',
  instructions: 'Use only supplied facts. Return concise bullets.',
})

const engineering = new Agent({
  id: 'engineering',
  model: model,
  name: 'Engineering specialist',
  description: 'Propose diagnostics and the safest technical next step.',
  instructions: 'Separate facts from hypotheses. Return concise bullets.',
})

const coordinator = new Agent({
  id: 'coordinator',
  model: model,
  instructions: 'Delegate when specialist analysis is needed, then synthesize one incident brief.',
  maxTurns: 4,
  tools: [support.asTool({ name: 'ask_support' }), engineering.asTool({ name: 'ask_engineering' })],
})

const response = await coordinator
  .prompt('Webhook retries failed for large payloads. Prepare an incident brief.')
  .send()

console.log(response.output)
```

## Run and expected behavior

The coordinator can call one or both specialist tools. Each tool input contains a `prompt`; the
child agent's final visible output becomes the tool result, and the coordinator synthesizes it on a
later turn. Delegation is model-driven, so exact calls can vary.

## Boundaries

An agent-as-tool increases latency, tokens, and failure surface. It does not create a security
boundary: give each child only the tools and context it needs, validate delegated prompts, and avoid
recursive delegation without strict limits. A child result is still model output, not verified fact.

In production, trace parent/child identity, cap turns and concurrency, propagate tenant context
deliberately, define partial-failure behavior, and prefer a deterministic pipeline when every
specialist must always run.

## Source and extensions

Run the full
[agent-as-tool cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/07_multi_agent/01-agent-as-tool.ts).
Next, stream child events or compare deterministic parallel specialists.

- [Agent as tool](/sdk/advanced/multi-agent/agent-as-tool)
- [Multi-agent failures](/sdk/advanced/multi-agent/failures)
