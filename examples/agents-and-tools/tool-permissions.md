# Tool permissions

Authorization belongs at the tool's application boundary. Build tools from authenticated scope so a model cannot grant itself access by changing prompt text or tool arguments.

## Create tools for one actor

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

type Actor = {
  userId: string
  tenantId: string
  roles: string[]
}

function createPayrollTools(actor: Actor) {
  const readPayroll = createTool({
    name: 'read_payroll',
    description: 'Read payroll information for one employee.',
    inputSchema: z.object({
      employeeId: z.string(),
    }),
    outputSchema: z.object({
      employeeId: z.string(),
      payBand: z.string(),
    }),
    async execute({ employeeId }) {
      if (!actor.roles.includes('payroll')) {
        throw new Error('Payroll access denied')
      }

      return payroll.findForTenant(actor.tenantId, employeeId)
    },
  })

  return [readPayroll]
}
```

Create the agent after authenticating the server request:

```ts
const actor = await authenticate(request)

const agent = new Agent({
  id: 'payroll-assistant',
  model,
  instructions: 'Use read_payroll for payroll facts.',
  tools: createPayrollTools(actor),
})

const result = await agent.generate({
    prompt: userMessage
})
```

`authenticate(...)` and the repository are application code. The trusted actor is captured by closure and never comes from the model.

## Enforce resource scope too

A role check alone is rarely enough. Query through a tenant-scoped repository and confirm the actor may access the specific employee or account. Return only fields the caller and model are allowed to see.

Permission failures should become safe application responses; avoid leaking confidential records through errors, traces, or prompts. Cover each allow and deny path with deterministic tests.

For a consequential action that also needs a human decision, add [tool approval](./tool-approval). Approval complements authorization; it does not replace it.
