# Middleware

Middleware transforms runtime data without changing the core tool contract. Use hooks when behavior decides whether a run continues; use middleware when data needs to be transformed.

## Create middleware

```ts
import { createMiddleware } from '@anvia/core'

const hideInternalErrors = createMiddleware({
  onToolOutput({ result }) {
    if (!result.includes('INTERNAL_')) {
      return
    }

    return 'The tool returned an internal service error.'
  },
})
```

## Attach it to an agent

```ts
const agent = new AgentBuilder('support', model)
  .middleware(hideInternalErrors)
  .build()
```

Agent middleware applies to every run. Request middleware applies only to one prompt.

```ts
const response = await agent
  .prompt(message)
  .withMiddleware(hideInternalErrors)
  .send()
```

## Choose an interception point

| Method | Runs when |
| --- | --- |
| `onCompletionRequest` | Before a provider-neutral request reaches the model. |
| `onCompletionResponse` | After the model responds and before the runtime continues. |
| `onToolInput` | After approval and before the tool handler runs. |
| `onToolOutput` | Before tool output is sent back to the model. |

Agent-level middleware runs before request-level middleware.

## Keep contracts in the handler

Middleware is useful for instrumentation, normalization, request shaping, large-result spillover, and output filtering. It must not bypass schema validation or replace handler authorization.
