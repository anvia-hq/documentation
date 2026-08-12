# Tool permissions

**Type:** Pattern

## Outcome

Use a hook to allow, skip, or cancel a tool call before its handler executes. Use this as a policy
boundary around sensitive reads and actions; do not rely on the model to decide its own access.

## Prerequisites

- The [tool-calling recipe](./tool-calling)
- Authenticated user and tenant context available in the server request
- `createHook` from `@anvia/core/hooks`

## Policy hook

```ts
import { createHook } from '@anvia/core/hooks'

type Actor = { userId: string; roles: string[] }

function permissionsFor(actor: Actor) {
  return createHook({
    onToolCall({ toolName, args, tool }) {
      if (toolName === 'read_payroll' && !actor.roles.includes('payroll')) {
        return tool.skip('Access denied. Explain that payroll data is restricted.')
      }

      if (toolName === 'delete_account') {
        return tool.requestApproval({
          reason: `Review deletion request: ${args}`,
          rejectMessage: 'Account deletion was not approved.',
        })
      }

      return tool.run()
    },
  })
}
```

Attach trusted context for one run instead of accepting roles from the prompt:

```ts
const actor = await authenticate(request)
const result = await agent
  .prompt(userMessage)
  .withHook(permissionsFor(actor))
  .send()
```

`authenticate(...)` is application code and is intentionally not implemented by Anvia.

## Run and expected behavior

With a non-payroll actor, `read_payroll` never executes and the model receives the skip message as
the tool result. Deletion is routed to the configured approval handler. Calls not matched by the
policy run normally.

## Boundaries

A hook is defense in depth, not the only authorization layer. Recheck the actor and resource scope
inside every sensitive handler because tools can be reused under another agent or hook. Avoid
including confidential records in skip messages, errors, traces, or prompts. If a policy state is
unknown, deny or cancel rather than silently running.

In production, centralize policies, log decisions without raw secrets, cover each allow/deny path
with deterministic tests, and make tenant-scoped repositories impossible to call without a trusted
tenant identifier.

## Source and extensions

The complete runnable policy is in the
[permission-hook cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/08-tool-permission-hook.ts).
Next, connect approval to Studio or a durable review queue.

- [Tool security](/sdk/tools/security)
- [Tool control hooks](/sdk/advanced/hooks/tool-control)
