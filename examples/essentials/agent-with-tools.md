# Agent with tools

**Type:** Recipe

## Outcome

Build an order-status agent that calls a typed application tool, receives its validated result, and
uses that result in a final answer.

- **Difficulty:** Beginner
- **Estimated time:** 15 minutes

## Prerequisites

- Node.js 22 or newer
- pnpm 11 or newer
- An OpenAI API key with access to `gpt-5`
- Familiarity with TypeScript functions and objects

## Packages used

- `@anvia/core` for `AgentBuilder` and `createTool(...)`
- `@anvia/openai` for the OpenAI completion model
- `zod` for validating tool input and output
- `tsx`, TypeScript, and Node.js types for running the TypeScript file

## Installation and environment setup

From an empty project directory, install the runtime and development packages:

```bash
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai zod
pnpm add --save-dev tsx typescript @types/node
```

Set the API key in the shell that will run the example:

```bash
export OPENAI_API_KEY=your_api_key
```

## Complete example

Create these three files in the same directory. The domain contract and data lookup stay separate
from the model-facing tool, while `agent.ts` owns provider configuration and the executable entry
point.

::: code-group

```ts [orders.ts]
import { z } from 'zod'

export const orderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['processing', 'shipped']),
  estimatedShipDate: z.iso.date(),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>

export async function findOrder(orderId: string): Promise<OrderStatus> {
  console.log(`Order service called for ${orderId}`)

  return {
    orderId,
    status: 'processing',
    estimatedShipDate: '2026-08-15',
  }
}
```

```ts [tools.ts]
import { createTool } from '@anvia/core'
import { z } from 'zod'
import { findOrder, orderStatusSchema } from './orders.js'

export const lookupOrder = createTool({
  name: 'lookup_order',
  description: 'Look up the current status of one order by its ID.',
  input: z.object({
    orderId: z.string().min(1).describe('The order ID to look up.'),
  }),
  output: orderStatusSchema,
  execute: ({ orderId }) => findOrder(orderId),
})
```

```ts [agent.ts]
import { AgentBuilder } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { lookupOrder } from './tools.js'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Set OPENAI_API_KEY before running this example.')
}

const openai = new OpenAIClient({ apiKey })
const model = openai.completionModel('gpt-5')

const agent = new AgentBuilder('order-status', model)
  .instructions(
    'Use lookup_order before answering order-status questions. Never invent order data.',
  )
  .tools([lookupOrder])
  .defaultMaxTurns(3)
  .build()

const response = await agent
  .prompt('Look up order ord_123 and tell me its status and estimated ship date.')
  .send()

console.log(response.output)
```

:::

`findOrder(...)` returns fixed demonstration data so the files run without a database. Replace that
function with an authorized service or repository call in a real application; keep the tool as the
validated boundary presented to the model.

## Run it

```bash
pnpm tsx agent.ts
```

## Expected behavior

On a successful run, the console shows `Order service called for ord_123`, proving that application
code ran, then prints the agent's final answer based on the tool result. The answer should report
the fixture's `processing` status and `2026-08-15` ship date, but its exact wording can vary by model.

## How it works

`createTool(...)` turns the Zod schemas and handler into a model-callable tool. Anvia parses the
model's arguments before `execute(...)` runs and validates the declared output afterward.

`AgentBuilder` registers the tool and stable instructions. When the model requests `lookup_order`,
the runtime executes the handler, returns its result to the model, and continues the loop until the
model produces a final answer or the three-turn limit is reached. `response.output` contains the
final visible answer.

## Production and security notes

- A valid `orderId` is not proof that the caller may access the order. Capture authenticated user
  and tenant context and enforce authorization inside the tool handler before reading data.
- Tool schemas validate shape, not permissions or business rules. Return only fields the model and
  user are allowed to see.
- Keep side-effecting tools narrow, authorized, audited, and idempotent where practical. Require a
  human approval flow for sensitive actions.
- Keep agent turns bounded and map tool, provider, and `MaxTurnsError` failures to safe application
  responses. Do not expose raw internal errors to users.

## Next steps

- [Define tools](/sdk/tools/define)
- [Add tools to an agent](/sdk/tools/add-to-an-agent)
- [Secure tool handlers](/sdk/tools/security)
- [Handle agent errors and limits](/sdk/agents/errors-and-limits)

## Source and extensions

This recipe follows the runnable
[tool-call cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/01-tool-call.ts).
Next, replace the fixture with an authorized repository, add a permission hook, or stream tool events
to a user interface.
