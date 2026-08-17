# Add tools to an agent

Pass the tools an agent may use to `Agent`. Keep the set small enough that each tool has a distinct purpose.

## Register tools

```ts
import { Agent } from '@anvia/core'

const agent = new Agent({
  id: 'billing',
  model: model,
  instructions: 'Use tools for account-specific information. Never guess invoice data.',
  maxTurns: 4,
  tools: [getInvoice, searchInvoices],
})

const response = await agent.generate({
    prompt: 'Has invoice inv_123 been paid?'
})

if (response.status === 'completed') {
  console.log(response.output)
}
```

The model chooses whether to call a tool and supplies its arguments. The runtime executes the handler, returns its result to the model, and continues until the agent produces a final answer or reaches its turn limit.

## Build user-scoped tools

Create the tools from the current application scope when handlers depend on user or tenant state.

```ts
export function createBillingAgent(scope: BillingScope) {
  return new Agent({
    id: 'billing',
    model: model,
    instructions: 'Use tools for account-specific information.',
    maxTurns: 4,
    tools: [createGetInvoiceTool(scope), createSearchInvoicesTool(scope)],
  })
}
```

Do not place mutable request state in a shared global tool. The handler should close over only the services and identity required for that run.

## Keep the loop bounded

Start with a small `maxTurns` option. If the agent repeatedly reaches it, improve instructions, tool descriptions, or result content before increasing the limit.
