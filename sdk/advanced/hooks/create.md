# Create a hook

Create a runtime hook with `createHook(...)`, then attach it to an agent or one prompt request.

## Define the callbacks you need

```ts
import { createHook } from '@anvia/core'

const supportPolicy = createHook({
  onRunStart({ maxTurns, run }) {
    if (maxTurns > 8) {
      return run.cancel('This workflow allows at most 8 turns.')
    }
  },
  onToolCall({ toolName, tool }) {
    if (toolName === 'delete_account') {
      return tool.requestApproval({
        reason: 'Deleting an account requires reviewer approval.',
      })
    }
  },
  onToolResult({ result, run }) {
    if (result.includes('POLICY_BLOCKED')) {
      return run.cancel('A downstream policy blocked the request.')
    }
  },
})
```

`createHook(...)` preserves type inference for each callback. Add only the lifecycle points the policy needs.

## Attach a default hook

Use `.hook(...)` for behavior that should apply to every run of the agent:

```ts
const agent = new Agent({
  id: 'support',
  model: model,
  hook: supportPolicy,
})
```

Stable environment policy and rules shared by every caller belong here.

## Set a hook for one request

Use `.withHook(...)` when the runner owns request-local policy:

```ts
const result = await agent
  .prompt(message)
  .withHook(supportPolicy)
  .send()
```

This keeps authentication and request scope near the route or worker that resolved them.

## Close over trusted state

Load external state before starting the run, then capture only the small policy object the hook needs:

```ts
const permissions = await policy.permissionsFor(user.id)

const requestHook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'request_refund' && !permissions.canRefund) {
      return tool.skip('Refund access is not available.')
    }
  },
})

return agent
  .prompt(message)
  .withHook(requestHook)
  .send()
```

Avoid loading the same user or policy record from several hook callbacks. Resolve it once at the runner boundary.

## Return an action only when needed

A callback that returns `undefined` continues the run. Use the provided `run` or `tool` control object when the callback must make an explicit decision; do not construct action objects by hand.
