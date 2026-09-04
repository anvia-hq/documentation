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
    modelId: 'gpt-5.6-sol',
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

`generate()` starts a run and resolves to a response, interaction, or guardrail block.

```ts
const response = await supportAgent.generate({
    prompt: 'What information do you need to investigate a failed checkout?'
})

if (response.type === 'interaction') {
  const resumed = await supportAgent.resume(
    response.continuation,
    { type: 'tool-approval', approved: true }
  )

  if (resumed.type === 'response') {
    console.log(resumed.output)
  }
} else if (response.type === 'blocked') {
  throw new Error(`Blocked at ${response.stage}: ${response.reason}`)
} else {
  console.log(response.output)
}
```

This agent has no guardrails or interaction-capable tools, so the expected type is `response`. The
checks keep the code correct when capabilities are added later.

An interaction pauses the run: the outcome carries the pending `interaction` request and a
`continuation`. `Agent.resume(continuation, response)` (or `generate({ continuation, response })`)
submits the answer and continues the run. A resumed outcome has a fresh `runId` and a
`resumedFrom: { runId, interactionId }` link to the paused run. The response shape matches the
request: `{ type: 'tool-approval', approved }` for approvals, `{ type: 'tool-question', answers }`
for questions.

## 3. Read the run result

A response outcome includes more than the visible answer:

```ts
if (response.type === 'response') {
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

  if (event.type === 'response' || event.type === 'interaction' || event.type === 'blocked') {
    process.stdout.write('\n')
    console.log(event.runId, event.usage)
  }
}
```

The same stream may later include reasoning, tool calls, tool results, interaction responses, turn boundaries, and errors.

`stream()` returns an `AgentStream` handle with more than iteration: `.textStream` yields only text
chunks, `.text` and `.result` resolve to the final text and outcome as promises, and `.result`
rejects if the run fails. `steer(input)` queues additional input mid-run and returns a
`{ id, status: 'queued' }` receipt; `cancel(reason?)` stops the run.

## Choose the next capability

- Add application actions with [Tools](/sdk/tools).
- Preserve conversation history with [Memory](/sdk/memory).
- Attach stable documents through [Context](/sdk/agents/context).
- Send runtime events to an interface with [Streaming](/sdk/streaming).
- Learn the full execution sequence in [Runtime lifecycle](/sdk/agents/runtime-lifecycle).
