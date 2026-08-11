# Tools and schemas

Mistral completion models support Anvia tools, tool choice, and output schemas. These are completion capabilities: the application still executes tools and validates their permissions.

## Add a tool to an agent

```ts
import { AgentBuilder, createTool } from '@anvia/core'
import { z } from 'zod'

const getOrder = createTool({
  name: 'get_order',
  description: 'Look up one order available to the current user.',
  input: z.object({
    orderId: z.string().min(1),
  }),
  output: z.object({
    id: z.string(),
    status: z.string(),
  }),
  async execute({ orderId }) {
    await auth.requireOrderAccess(user.id, orderId)
    return orders.get(orderId)
  },
})

const agent = new AgentBuilder('order-support', model)
  .instructions(
    'Use get_order for account-specific status. Never guess order data.',
  )
  .tools([getOrder])
  .defaultMaxTurns(4)
  .build()
```

The runtime validates model-supplied arguments, executes the application handler, returns the result to the model, and continues until a final answer or the turn limit. Authorization belongs inside the tool boundary; model arguments are never proof of access.

## Control tool choice

Keep automatic selection for ordinary agents. Use a required choice only when every valid run must call a tool:

```ts
const agent = new AgentBuilder('order-status', model)
  .instructions('Look up the order before answering.')
  .tools([getOrder])
  .toolChoice('required')
  .defaultMaxTurns(3)
  .build()
```

Test the selected Mistral model with required tool choice and streaming tool arguments before depending on it in production.

## Return structured output

For a single schema-validated generation, use `createParsedCompletion(...)`:

```ts
import { createParsedCompletion } from '@anvia/core'
import { z } from 'zod'

const incidentSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  summary: z.string(),
  needsFollowUp: z.boolean(),
})

const result = await createParsedCompletion(model, {
  input: 'Checkout requests timed out for 12 minutes.',
  schema: incidentSchema,
})

console.log(result.data.severity)
```

Use agent `.outputSchema(...)` when tools or runtime context must run before the final structured answer. A schema validates shape, not truth: validate identifiers, permissions, and business rules before any product write.

## Know the boundary

Mistral tools here are normal Anvia application tools. The current adapter does not expose provider-executed tools. Keep tool handlers observable, bounded, idempotent where practical, and explicit about side effects.
