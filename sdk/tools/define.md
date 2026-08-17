# Define a tool

Use `createTool(...)` to turn a Zod schema and an application handler into a model-callable tool.

## Define the contract

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const getInvoice = createTool({
  name: 'get_invoice',
  description: 'Look up one invoice available to the current user.',
  inputSchema: z.object({
    invoiceId: z.string().min(1).describe('The invoice ID to inspect.'),
  }),
  outputSchema: z.object({
    id: z.string(),
    status: z.enum(['draft', 'open', 'paid', 'void']),
    totalCents: z.number().int(),
  }),
  async execute({ invoiceId }) {
    await auth.requireInvoiceAccess(user.id, invoiceId)

    const invoice = await billing.getInvoice(invoiceId)

    return {
      id: invoice.id,
      status: invoice.status,
      totalCents: invoice.totalCents,
    }
  },
})
```

The input schema gives `execute(...)` typed arguments and rejects invalid model input before the handler runs. The optional output schema validates the handler result and prevents undeclared fields from reaching the model.

## Name and describe it clearly

Use a short, action-oriented name such as `get_invoice`, `search_orders`, or `request_refund`. A description should say when to use the tool and what it returns.

Tool names and descriptions are part of the model-facing API. Changing them can change when the model chooses the tool.

## Capture request scope

Create a tool inside the current request or workflow when it needs a user, tenant, service client, feature flag, or audit handle.

```ts
export function createGetInvoiceTool(scope: BillingScope) {
  return createTool({
    name: 'get_invoice',
    description: 'Look up one invoice available to the current user.',
    inputSchema: z.object({ invoiceId: z.string().min(1) }),
    async execute({ invoiceId }) {
      await scope.auth.requireInvoiceAccess(scope.user.id, invoiceId)
      return scope.billing.getInvoice(invoiceId)
    },
  })
}
```

Closing over request scope keeps mutable user state out of global agents and makes the handler easy to test with fake services.
