# Validation and execution

Anvia validates the model-facing contract. Your handler validates whether the requested operation is allowed and correct for the product.

## Validation boundaries

| Boundary | Responsibility |
| --- | --- |
| Input schema | Parse and validate model arguments before `execute(...)`. |
| Handler | Enforce authorization, tenancy, business rules, and service behavior. |
| Output schema | Validate the value returned to the runtime. |
| Application runner | Map tool and provider failures to safe product responses. |

An input schema is not an authorization rule. A valid `invoiceId` can still belong to another user, so the handler must check access before reading or changing data.

## Handle expected and unexpected failures

Return a concise result when a miss is expected and safe for the model to reason about.

```ts
async execute({ orderId }) {
  const order = await orders.find(orderId)

  if (order === undefined) {
    return 'No order was found for that ID.'
  }

  return `Order ${order.id} is ${order.status}.`
}
```

Throw for dependency failures, invalid service state, or rejected policy checks. During an agent run, Anvia normally converts the failure into safe model-visible tool output so the agent can respond or recover. Use lifecycle callbacks for observation; enforce a hard policy before or inside the handler.

## Receive a call context

`execute` receives a second `context` argument alongside the parsed input.

```ts
async execute({ orderId }, context) {
  const order = await orders.find(orderId, { signal: context.abortSignal })
  return `Order ${order.id} is ${order.status}.`
}
```

`context.abortSignal` aborts when the run stops, so pass it to in-flight work. `context.emitStreamEvent` emits custom events on the run's stream while the handler executes. Direct calls pass the same context: `tool.call(input, context)`.

Application code can call a known tool directly through `tool.call(input)`. The agent runtime owns model-produced JSON parsing, tool lookup, and the corresponding tool-call errors.

## Call through the agent

The agent registry resolves the tools passed to `Agent`. `agent.getTool(name)` returns a registered tool, and `agent.callTool(name, args)` parses a JSON argument string the way the runtime does for the model, validates it against the input schema, and returns the normalized output (`{ type: 'text' | 'json' | 'content', ... }`).

```ts
const result = await agent.callTool('get_invoice', JSON.stringify({ invoiceId: 'inv_123' }))
```

This path skips run-level hooks, approval, and middleware, so reserve it for trusted application code.

## Test the handler first

Call the tool directly so contract and product behavior can be tested without a provider request.

```ts
const tool = createGetInvoiceTool(fakeScope)
const result = await tool.call({ invoiceId: 'inv_123' })

expect(result.status).toBe('paid')
```

Add agent-level tests separately for tool selection, argument quality, and failure recovery.
