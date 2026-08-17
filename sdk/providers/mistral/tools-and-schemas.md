# Tools and schemas

Mistral completion models support normal Anvia tools, tool choice, and output schemas. The model can request a tool, but your application executes it and remains responsible for authorization.

## Add a tool to an agent

Define the tool boundary with Zod schemas:

```ts
import { Agent, createTool } from '@anvia/core'
import { z } from 'zod'

const getOrder = createTool({
  name: 'get_order',
  description: 'Look up one order available to the current user.',
  inputSchema: z.object({
    orderId: z.string().min(1),
  }),
  outputSchema: z.object({
    id: z.string(),
    status: z.string(),
  }),
  async execute({ orderId }) {
    await auth.requireOrderAccess(user.id, orderId)
    return orders.get(orderId)
  },
})

const agent = new Agent({
  id: 'order-support',
  model,
  instructions: 'Use get_order for account-specific status. Never guess order data.',
  maxTurns: 4,
  tools: [getOrder],
})
```

The runtime validates the model-supplied input, calls `execute`, validates the returned value when `outputSchema` is present, and gives the result back to the model. Authorization belongs inside the tool boundary; model arguments are not proof of access.

## Control tool choice

Automatic selection is appropriate for ordinary agents. Require a tool only when every valid run must call one:

```ts
const agent = new Agent({
  id: 'order-status',
  model,
  instructions: 'Look up the order before answering.',
  toolChoice: 'required',
  maxTurns: 3,
  tools: [getOrder],
})

const result = await agent.generate({
    prompt: 'Where is order ord_123?'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

Test required tool choice and streamed tool arguments with the exact Mistral model selected for production.

## Parse a structured result

Use `generateCompletion(...)` for one schema-validated model call:

```ts
import { generateCompletion } from '@anvia/core'
import { z } from 'zod'

const incidentSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  summary: z.string(),
  needsFollowUp: z.boolean(),
})

const result = await generateCompletion({
    prompt: 'Checkout requests timed out for 12 minutes.',
    model,
    outputSchema: incidentSchema
})

console.log(result.output.severity)
```

Use an agent `outputSchema` when tools or runtime context must run before the final structured answer:

```ts
const triageAgent = new Agent({
  id: 'incident-triage',
  model,
  instructions: 'Classify the incident from the available evidence.',
  outputSchema: incidentSchema,
})

const result = await triageAgent.generate({
    prompt: incidentText
})

if (result.status === 'completed') {
  const incident = incidentSchema.parse(JSON.parse(result.output))
  console.log(incident.severity)
}
```

A schema validates structure, not truth. Validate identifiers, permissions, and business rules before any product write.

The current Mistral adapter does not expose provider-executed tools. Keep application tool handlers bounded, observable, and idempotent where practical.
