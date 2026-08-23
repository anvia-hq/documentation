# Interactions and continuations

An Agent interaction is an intentional, JSON-safe boundary where one run phase ends and control
returns to the application. The v1 RC supports two interaction types:

- `tool-approval` asks whether one validated tool call may execute;
- `tool-question` asks for structured human answers before the tool call continues.

`generate()` and the terminal event from `stream()` return the same `interaction` outcome. It
contains the public interaction request plus an opaque continuation that trusted server code can
use to start a linked phase.

## Handle an approval

```ts
let result = await agent.generate({ prompt: 'Refund order A-100.' })

while (result.type === 'interaction') {
  if (result.interaction.type !== 'tool-approval') {
    throw new Error(`Unsupported interaction: ${result.interaction.type}`)
  }

  const decision = await approvals.decide({
    interactionId: result.interaction.id,
    toolName: result.interaction.toolName,
    input: result.interaction.input,
    reason: result.interaction.reason,
  })

  result = await agent.resume(
    result.continuation,
    {
      type: 'tool-approval',
      approved: decision.approved,
      reason: decision.reason,
    },
  )
}

if (result.type === 'response') console.log(result.output)
```

The continued phase receives a new `runId`. Its `resumedFrom` link contains the source run and interaction IDs so traces and application records can reconstruct the chain.

## Ask structured questions

```ts
import { createQuestionTool } from '@anvia/core/tool'

const askOperator = createQuestionTool({
  name: 'ask_operator',
  description: 'Ask the operator for missing details before continuing.',
})

const agent = new Agent({
  id: 'support-escalation',
  model,
  instructions: 'Use ask_operator when priority or delivery channel is missing.',
  tools: [askOperator],
})
```

The model supplies one or more prompts with a stable ID, text, optional choices, and optional custom-answer support. Continue a question with one answer for every requested ID:

```ts
if (result.type === 'interaction' && result.interaction.type === 'tool-question') {
  const continued = await agent.resume(
    result.continuation,
    {
      type: 'tool-question',
      answers: result.interaction.questions.map((question) => ({
        questionId: question.id,
        value: answersById[question.id],
      })),
    },
  )
}
```

Core rejects missing, duplicate, or undeclared choice answers when custom input is disabled.

## Continue a stream

Consume a stream through its terminal outcome. When it yields an interaction, resume with
`agent.stream({ continuation, response })`:

```ts
const first = agent.stream({ prompt: message })
let pending: Extract<Awaited<typeof first.result>, { type: 'interaction' }> | undefined

for await (const event of first) {
  if (event.type === 'interaction') pending = event
}

if (pending?.interaction.type === 'tool-approval') {
  const next = agent.stream({
    continuation: pending.continuation,
    response: { type: 'tool-approval', approved: true },
  })

  for await (const event of next) {
    if (event.type === 'text_delta') process.stdout.write(event.delta)
  }
}
```

## Own persistence and claims

Continuations contain strict JSON, but they are trusted runtime state—not browser authorization tokens. Keep them server-side and store them with the authenticated actor, tenant, agent ID, interaction ID, expiry, and claim state.

Before continuing:

1. authenticate and authorize the responder;
2. atomically claim the still-pending interaction;
3. verify the response type matches the request;
4. call the originating agent with `{ continuation, response }`; and
5. recheck current authorization and resource state inside the tool handler.

Core validates continuation integrity against the current Agent and tool catalog. It does not supply a durable continuation store, distributed lock, expiry policy, or exactly-once side-effect guarantee.

For browser applications, Client Protocol v3 represents responses as `type: 'interaction_response'`. `useChat()` exposes pending interactions and sends matching responses, while the server remains responsible for mapping the interaction ID to its protected continuation.

Continue with [Tool approval](/sdk/advanced/hooks/tool-control), [Server transport](/sdk/streaming/server-transport), or [Studio approvals and questions](/studio/playground/approvals-and-questions).
