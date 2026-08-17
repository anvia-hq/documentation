# Lifecycle and middleware

Lifecycle observes immutable runtime snapshots. Middleware transforms data moving through completion and tool boundaries.

## 1. Observe with lifecycle

```ts
const lifecycle: AgentLifecycle = {
  onToolFinish({ toolName, success, durationMs }) {
    toolMetrics.record({ toolName, success, durationMs })
  },
}
```

Lifecycle callback return values are ignored. Throwing fails the run rather than replacing data.

## 2. Transform with middleware

```ts
import { createMiddleware } from '@anvia/core'

const hideInternalErrors = createMiddleware({
  onToolOutput({ result }) {
    if (result.includes('INTERNAL_')) {
      return 'The service returned an internal error.'
    }
  },
})
```

Returning `undefined` keeps the current value. Tool output middleware may return replacement text or an object containing replacement text and structured result content.

Middleware also supports `onCompletionRequest`, `onCompletionResponse`, and `onToolInput`. Preserve valid request and response shapes when replacing them.

## 3. Attach stable and request-local behavior

```ts
const agent = new Agent({
  id: 'support',
  model,
  lifecycle,
  middlewares: [hideInternalErrors],
})

const result = await agent.generate({
    prompt: message,
    lifecycle: requestLifecycle,
    middlewares: [requestRedaction]
})
```

Agent middleware runs before request-local middleware. Each middleware receives the current value and the original boundary value.

## 4. Choose the other public controls

Use guardrails when model input or output must be allowed, blocked, or rewritten with a recorded policy decision.

Use `requiresApproval` when a tool must suspend before execution. Keep authorization and schema validation in the tool itself even when middleware redacts its model-facing result.

Next, apply the [production guidance](/sdk/advanced/hooks/production-guidance).
