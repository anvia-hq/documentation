# Tools

Tools let an agent read product data, call services, and request side effects through contracts owned by your application.

## How a tool call works

The model sees a tool name, description, and JSON schema. When it requests that tool, Anvia parses the arguments, validates them, calls the application handler, validates any declared output schema, and sends the result back into the agent run.

```text
Model request → input validation → application handler → output validation → tool result
```

Schemas protect the shape of the boundary. They do not replace authentication, authorization, business validation, rate limits, or audit logging inside the handler.

## 1. Define a typed tool

Install Zod alongside the v1 RC runtime if it is not already in the project:

```bash
pnpm add @anvia/core@rc zod
```

Use `inputSchema` for model-supplied arguments and `outputSchema` when the returned value should also be validated.

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const getWeather = createTool({
  name: 'get_weather',
  description: 'Get the current weather for a city.',
  inputSchema: z.object({
    city: z.string().min(1).describe('The city to check.'),
  }),
  outputSchema: z.object({
    city: z.string(),
    forecast: z.string(),
  }),
  async execute({ city }) {
    return {
      city,
      forecast: await weather.getCurrent(city),
    }
  },
})
```

The inferred handler input comes from `inputSchema`. If `outputSchema` is present, returning an incompatible value fails before the result is sent back to the model.

## 2. Add the tool to an agent

Register tools in the agent options. Set enough turns for the model to request the tool, receive its result, and produce the final answer.

```ts
import { Agent } from '@anvia/core'

const weatherAgent = new Agent({
  id: 'weather',
  model,
  instructions: 'Use the weather tool when a user asks about weather.',
  maxTurns: 2,
  tools: [getWeather],
})

const response = await weatherAgent.generate({
    prompt: 'What is the weather in Jakarta?'
})

if (response.status === 'completed') {
  console.log(response.output)
}
```

The model chooses whether to call the tool unless the agent configures a stricter tool choice.

## 3. Observe tool events

Streaming exposes the tool lifecycle as normalized events. An interface can show progress without interpreting provider-specific payloads.

```ts
for await (const event of weatherAgent.stream({
    prompt: 'Check Jakarta weather.'
})) {
  if (event.type === 'tool_call') {
    console.log('Calling:', event.toolCall.function.name)
  }

  if (event.type === 'tool_result') {
    console.log('Result:', event.result)
  }

  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

## 4. Require approval for side effects

Read-only lookups can usually execute immediately. Mutations such as refunds, messages, or deployments should be able to pause before execution.

```ts
const refundOrder = createTool({
  name: 'refund_order',
  description: 'Refund an eligible order.',
  inputSchema: z.object({ orderId: z.string() }),
  requiresApproval: ({ orderId }) => ({
    reason: `Approve refund for ${orderId}`,
  }),
  execute: async ({ orderId }) => billing.refund(orderId),
})
```

When approval is required, `generate()` returns `status: 'suspended'` before the handler runs. The application can approve or reject that specific interaction through `agent.generate({ continuation, response })`.

## Explore tools

- [Define a tool](/sdk/tools/define)
- [Validation and execution](/sdk/tools/validation-and-execution)
- [Add tools to an agent](/sdk/tools/add-to-an-agent)
- [Tool results](/sdk/tools/results)
- [Middleware](/sdk/tools/middleware)
- [Security](/sdk/tools/security)
