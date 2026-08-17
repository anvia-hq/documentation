# Your first agent

This tutorial turns a working provider model into a reusable agent with a stable identity, instructions, bounded execution, and normalized runtime results.

Complete [Install and setup](/sdk/install-and-setup) first. You should already have a provider model that can perform a direct completion.

## 1. Construct the agent

Pass the provider model and reusable behavior directly to the v1 `Agent` constructor.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly. Ask for missing details.',
  maxTurns: 4,
})
```

Each option has a distinct responsibility:

- `id` gives runs, sessions, Studio, and observability a stable agent identity.
- `model` supplies the provider-backed completion implementation.
- `instructions` define behavior reused across runs.
- `maxTurns` bounds the default model and tool loop.

Tools, memory, context, guardrails, middleware, and observers can be added to the same options object later.

## 2. Generate the first answer

`generate()` starts a run and resolves when it completes or pauses for tool approval.

```ts
const response = await supportAgent.generate({
    prompt: 'What information do you need to investigate a failed checkout?'
})

if (response.status === 'approval_required') {
  throw new Error(`Approval required for ${response.approval.toolName}`)
}

console.log(response.output)
```

This agent has no approval-gated tools, so the expected status is `completed`. The check keeps the code correct when tools are added later.

## 3. Read the run result

A completed response includes more than the visible answer:

```ts
if (response.status === 'completed') {
  console.log({
    runId: response.runId,
    output: response.output,
    messages: response.messages,
    usage: response.usage,
    contextUsage: response.contextUsage,
  })
}
```

Store or expose only the fields the application needs. Messages and model output may contain sensitive user or product data.

## 4. Override a limit for one run

Agent options define reusable defaults. Per-run options can tighten behavior without mutating the agent.

```ts
const shortResponse = await supportAgent.generate({
    prompt: 'Give the first troubleshooting step only.',
    maxTurns: 1
})
```

Use conservative defaults in production and increase limits only for flows that demonstrate a need for additional turns.

## 5. Stream an answer

Use `stream()` when a terminal or interface should update as the run progresses.

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a short customer reply.'
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log(event.result.runId, event.result.usage)
  }
}
```

The same stream may later include reasoning, tool calls, tool results, approval requests, turn boundaries, and errors.

## Choose the next capability

- Add application actions with [Tools](/sdk/tools).
- Preserve conversation history with [Memory](/sdk/memory).
- Attach stable documents through [Context](/sdk/agents/context).
- Send runtime events to an interface with [Streaming](/sdk/streaming).
- Learn the full execution sequence in [Runtime lifecycle](/sdk/agents/runtime-lifecycle).
