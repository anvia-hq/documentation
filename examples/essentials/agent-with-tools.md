# Agent with tools

This recipe creates an order-status agent that calls typed application code and uses the validated result in its answer.

## 1. Install the dependencies

```sh
pnpm add @anvia/core @anvia/openai zod
pnpm add --save-dev tsx typescript @types/node
```

Set `OPENAI_API_KEY` in the server environment.

## 2. Define the application service

```ts
// orders.ts
import { z } from 'zod'

export const orderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['processing', 'shipped']),
  estimatedShipDate: z.iso.date(),
})

export async function findOrder(orderId: string) {
  console.log(`Order service called for ${orderId}`)

  return {
    orderId,
    status: 'processing' as const,
    estimatedShipDate: '2026-08-15',
  }
}
```

This fixture makes the example runnable without a database. A production service must also accept trusted user and tenant scope.

## 3. Expose a narrow tool

```ts
// tools.ts
import { createTool } from '@anvia/core'
import { z } from 'zod'
import { findOrder, orderStatusSchema } from './orders.js'

export const lookupOrder = createTool({
  name: 'lookup_order',
  description: 'Look up the current status of one order by its ID.',
  inputSchema: z.object({
    orderId: z.string().min(1),
  }),
  outputSchema: orderStatusSchema,
  execute: ({ orderId }) => findOrder(orderId),
})
```

`inputSchema` validates model-supplied arguments before `execute` runs. `outputSchema` validates application data before it returns to the model.

## 4. Run the agent

```ts
// agent.ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { lookupOrder } from './tools.js'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const agent = new Agent({
  id: 'order-status',
  model: new OpenAIClient({ apiKey }).completionModel({
      modelId: 'gpt-5.5',
      api: "responses"
  }),
  instructions: 'Use lookup_order before answering. Never invent order data.',
  maxTurns: 3,
  tools: [lookupOrder],
})

const result = await agent.generate({
    prompt: 'Look up order ord_123 and tell me its status and ship date.'
})

if (result.status === 'approval_required') {
  throw new Error(`Approval required for ${result.approval.toolName}`)
}
if (result.status === 'blocked') throw new Error(`Agent blocked at ${result.stage}`)

console.log(result.output)
```

Run it with `pnpm tsx agent.ts`. The console first shows the service lookup, then the agent's final answer.

## Secure the real boundary

A valid `orderId` does not authorize access. Capture authenticated scope when constructing the tool and enforce it inside `execute` before reading data. Return only fields the caller may see.

Keep side-effecting tools narrow, authorized, audited, and idempotent where practical. Add [tool approval](../agents-and-tools/tool-approval) for sensitive actions.
