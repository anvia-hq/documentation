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

if (response.type === 'response') {
  console.log(response.output)
}
```

The model chooses whether to call a tool and supplies its arguments. The runtime executes the handler, returns its result to the model, and continues until the agent produces a final answer or reaches its turn limit.

The `tools` array also accepts provider tools, which the model provider executes itself instead of Anvia's local runtime, and a `ToolIndex` for dynamic discovery: build one with `createToolIndex({ model, tools, topK })` and the agent exposes only the tools most relevant to each prompt. See [Dynamic tools](/sdk/advanced/dynamic-tools).

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
