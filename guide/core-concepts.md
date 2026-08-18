# Core concepts

Anvia keeps its runtime primitives separate so an application can adopt only the behavior it needs. The provider, agent, tools, memory, and transport are explicit objects rather than hidden global configuration.

## Models are the provider boundary

A provider package creates a model that implements Anvia's completion contract. Provider credentials and options stay in the provider-specific construction step.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})
```

Agents, extractors, and pipelines depend on that model interface. Switching providers does not require moving provider-specific configuration into those higher-level primitives.

## Completions are one model call

Use `generateCompletion()` when application code owns the entire interaction and does not need an agent loop.

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize this support ticket.',
    model,
    instructions: 'Return one concise paragraph.'
})

console.log(result.text)
```

Use `streamCompletion()` for the same direct interaction when output should arrive incrementally.

## Agents own reusable runtime behavior

An agent combines a model with stable instructions and optional tools, context, memory, guardrails, observers, middleware, and run limits.

```ts
import { Agent } from '@anvia/core'

const agent = new Agent({
  id: 'support',
  model,
  instructions: 'Help customers understand their orders.',
  maxTurns: 4,
})

const response = await agent.generate({
    prompt: 'Where is order A-100?'
})
```

Each call to `generate()` or `stream()` creates an independent run. Per-run options can tighten limits or attach lifecycle, guardrail, retry, middleware, and tracing behavior without changing the agent object.

## Tools expose application-owned actions

Tools let the model request a narrow operation. Anvia validates declared input and output schemas; the application still owns authorization, business rules, side effects, and redaction.

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const lookupOrder = createTool({
  name: 'lookup_order',
  description: 'Look up an order by id.',
  inputSchema: z.object({
    orderId: z.string(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    status: z.string(),
  }),
  execute: async ({ orderId }) => ({ orderId, status: 'processing' }),
})
```

Pass the tool through the agent options. During a run, Anvia sends its definition to the model, executes valid tool requests, and returns normalized tool results to the next turn.

## Memory is durable session history

A memory store loads and appends normalized messages. The agent supplies the policy; a session supplies the durable identity.

```ts
const memoryAgent = new Agent({
    id: 'support',
    model,
    memory: { store: memoryStore },
});
const session = { sessionId: 'thread_123', userId: 'user_456', metadata: { tenantId: 'tenant_789' } };
await memoryAgent.generate({
    prompt: 'Remember that my project is named Anvia.',
    session: session
});
const response = await memoryAgent.generate({
    prompt: 'What is my project named?',
    session: session
});
```

Session identity scopes storage; it does not authorize access. Authenticate the caller and verify the user or tenant before creating the session.

## Context supplies stable knowledge

Small policies, glossaries, and checklists can be attached directly as documents. They are supplied to the model without requiring a tool call.

```ts
const policyAgent = new Agent({
  id: 'policy-support',
  model,
  context: [
    {
      id: 'refund-policy',
      text: 'Refunds are available within 30 days of delivery.',
    },
  ],
})
```

Use retrieval indexes for large or frequently changing knowledge collections so only relevant documents enter a run.

## Streams are the application boundary

Agent streams expose structured events such as `turn_start`, `text_delta`, `reasoning_delta`, `tool_call`, `tool_result`, `turn_end`, `interaction_response`, `final`, and `error`.

```ts
for await (const event of agent.stream({
    prompt: 'Explain order A-100.'
})) {
  if (event.type === 'text_delta') process.stdout.write(event.delta)
  if (event.type === 'tool_result') console.log(event.toolName, event.result)
  if (event.type === 'final') console.log(event.result.runId, event.result.usage)
}
```

The same event model can drive a terminal, an HTTP response, a React interface, application logs, or an observability system without changing the agent.
