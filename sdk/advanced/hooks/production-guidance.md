# Production guidance

Treat hooks as part of the runtime policy boundary: deterministic, fast, observable, and covered by direct tests.

## Resolve external state before the run

Load permissions, feature flags, and environment policy in the route or worker. Close over a small immutable policy object instead of making repeated network calls from callbacks.

```ts
const policy = await policies.forUser(user.id)

const hook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'request_refund' && !policy.canRefund) {
      return tool.skip('Refund access is not available.')
    }
  },
})

return agent
  .prompt(message)
  .withHook(hook)
  .send()
```

Long hook calls add latency to the runtime and make the decision harder to reproduce.

## Keep reasons explicit

Give cancellation, skip, and approval actions stable internal reasons. They help tests, audit records, and debugging even when the product returns a more generic message to the user.

Do not place secrets, raw credentials, or private service responses in a reason that may reach a model, trace, log, or UI.

## Preserve the real error

Use hook cancellation for intentional policy decisions. Let provider failures, tool failures, validation errors, and timeouts keep their original error types so the runner can retry or map them correctly.

## Test without a provider

Hook policy can be tested by calling a fake agent model or by exercising the callback through a small agent harness. Cover the decision boundaries:

- allowed calls continue
- rejected calls never execute the tool
- skipped calls return a safe reason
- cancelled runs raise `PromptCancelledError`
- approval-required calls reach the configured handler

Also test tool authorization independently. A passing hook test does not prove that the handler is safe.

## Before shipping

- Keep callbacks deterministic and short.
- Resolve request-local state before the run.
- Use explicit, non-sensitive action reasons.
- Keep tool authorization and validation in handlers.
- Catch cancellation only at the runner boundary.
- Observe decisions without logging private payloads.
- Make completed side effects idempotent or auditable.
