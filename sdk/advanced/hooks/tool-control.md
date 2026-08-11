# Tool control

`onToolCall` gives application policy a final decision after the model selects a tool and before its handler executes.

## Choose a tool action

| Action | Result |
| --- | --- |
| `tool.run()` | Execute the selected tool. |
| `tool.skip(reason)` | Return the reason as the tool result and let the agent continue. |
| `tool.cancel(reason)` | Stop the entire prompt run. |
| `tool.requestApproval(options)` | Pause for the configured approval workflow. |

Returning nothing also allows the tool to run.

## Gate a tool with request policy

```ts
import { createHook } from '@anvia/core'

function createToolPolicy(scope: {
  canRequestRefund: boolean
  requiresRefundApproval: boolean
}) {
  return createHook({
    onToolCall({ toolName, tool }) {
      if (toolName !== 'request_refund') {
        return tool.run()
      }

      if (!scope.canRequestRefund) {
        return tool.skip('Refund access is not available.')
      }

      if (scope.requiresRefundApproval) {
        return tool.requestApproval({
          reason: 'This refund requires reviewer approval.',
        })
      }

      return tool.run()
    },
  })
}
```

Build `scope` from authenticated application state before the run. Do not ask the model whether the user has permission.

## Skip or cancel

Use `tool.skip(...)` when the rejected call can become information for the next model turn. The skip reason is returned as the tool result, so the model can explain the limitation or choose another path.

Use `tool.cancel(...)` when continuing the run would itself be unsafe or meaningless.

```ts
const hook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'deploy_release' && deployment.frozen) {
      return tool.cancel('Deployments are frozen.')
    }
  },
})
```

## Request approval

```ts
const hook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'delete_account') {
      return tool.requestApproval({
        reason: 'Deleting an account requires reviewer approval.',
      })
    }
  },
})
```

The prompt request must have an approval handler. Without one, Anvia raises `ToolApprovalRequiredError`. See [Human approval](https://anvia.dev/docs/advanced/tool-approvals) for the full approval lifecycle.

## Keep enforcement in the tool

Hooks improve orchestration, but the tool handler remains the security boundary. It must validate its parsed input, re-check user and tenant permissions, enforce business rules, and protect side effects even if the hook allowed the call.
