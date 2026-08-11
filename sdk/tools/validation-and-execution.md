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

Throw for dependency failures, invalid service state, or rejected policy checks. During an agent run, Anvia reports the failure to `onToolError` and normally returns safe error text to the model. Cancel from the hook when the failure must stop the run.

Lower-level integrations can distinguish `ToolJsonError`, `ToolCallError`, and `ToolNotFoundError` around `ToolSet.call(...)`.

## Test the handler first

Call the tool directly so contract and product behavior can be tested without a provider request.

```ts
const tool = createGetInvoiceTool(fakeScope)
const result = await tool.call({ invoiceId: 'inv_123' })

expect(result.status).toBe('paid')
```

Add agent-level tests separately for tool selection, argument quality, and failure recovery.
