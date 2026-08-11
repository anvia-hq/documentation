# Hooks and middleware

Hooks control whether runtime work proceeds. Middleware transforms data as it moves through the runtime.

## Choose by responsibility

| Need | Use |
| --- | --- |
| Cancel a run because of policy | Hook |
| Skip or approve a tool call | Hook |
| React to run, turn, or completion lifecycle | Hook |
| Redact a completion request | Middleware |
| Normalize tool input or output | Middleware |
| Add metadata or instrumentation to runtime data | Middleware |
| Collect passive telemetry | Observer |

The distinction is control flow versus transformation. If code decides whether the run continues, it is a hook.

## Control with a hook

```ts
import { createHook } from '@anvia/core'

const policyHook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'export_customer_data' && !scope.canExport) {
      return tool.skip('Data export is not permitted.')
    }
  },
})
```

The hook returns a runtime action. It does not rewrite the tool result.

## Transform with middleware

```ts
import { createMiddleware } from '@anvia/core'

const hideInternalErrors = createMiddleware({
  onToolOutput({ result }) {
    if (result.includes('INTERNAL_')) {
      return 'The tool returned an internal service error.'
    }
  },
})
```

The middleware returns replacement data. It does not cancel the run.

## Attach at the same scope

Stable behavior belongs on the agent:

```ts
const agent = new AgentBuilder('support', model)
  .hook(policyHook)
  .middleware(hideInternalErrors)
  .build()
```

Request-local behavior belongs on the prompt request:

```ts
const result = await agent
  .prompt(message)
  .withHook(policyHook)
  .withMiddleware(hideInternalErrors)
  .send()
```

Keep authorization in the tool handler even when a hook gates the call. Keep schema validation intact even when middleware transforms input or output.
