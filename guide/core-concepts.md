# Core concepts

Anvia keeps runtime primitives separate so applications can adopt only the behavior they need.

| Primitive | Responsibility |
| --- | --- |
| Model | A provider-neutral completion interface created by a provider package. |
| Completion | One model call controlled directly by application code. |
| Agent | Reusable instructions and runtime behavior around a model. |
| Prompt | One configured agent request, executed with `send()` or `stream()`. |
| Tool | A typed application action the model may request. |
| Memory | Durable message history loaded by session identity. |
| Context | Stable documents attached to requests without a tool call. |
| Observer | A consumer of structured runtime lifecycle events. |

## Completions and agents

Use `createCompletion` for one request where your application owns every step. Use `createCompletionStream` when that same call should emit text incrementally.

Use an agent when behavior is reused or needs multiple model/tool turns. `AgentBuilder` defines stable defaults; each `agent.prompt(...)` creates an independent request that may override them.

## Tools

Tools connect a model to product data and actions. Inputs are parsed before application code runs, and an optional output schema validates the result.

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const lookupOrder = createTool({
  name: 'lookup_order',
  description: 'Look up an order by id.',
  input: z.object({ orderId: z.string() }),
  output: z.object({ orderId: z.string(), status: z.string() }),
  execute: async ({ orderId }) => ({ orderId, status: 'processing' }),
})
```

Keep tools narrow. Authorization remains the application's responsibility, even when schemas validate the shape of a call.

## Memory and sessions

Memory stores conversation history. A session supplies the durable identity used to load and append that history:

```ts
const session = agent.session('thread_123', {
  userId: 'user_456',
  metadata: { tenantId: 'tenant_789' },
})

await session.prompt('Remember that my project is named Anvia.').send()
const response = await session.prompt('What is my project named?').send()
```

Storage scope isolates records; it does not authorize access. Verify the current user before invoking a session.

## Context and retrieval

Static context sends the same small, stable document with each request. Use it for policies, glossaries, or checklists. Use retrieval for large or frequently changing knowledge bases so the application can select relevant material first.

## Runtime events

Agent streams expose structured events including `turn_start`, `text_delta`, `reasoning_delta`, `tool_call`, `tool_result`, `turn_end`, `agent_tool_event`, `final`, and `error`.

The same event model can drive a terminal, an HTTP stream, a React interface, application logs, or an observability system without changing the agent itself.
