# Cancellation

Hook cancellation stops an agent run because application policy decided it must not continue.

## Cancel inside a hook

`run.cancel(...)` is available inside hook callbacks. Return its action from the callback:

```ts
import { createHook } from '@anvia/core'

const environmentGuard = createHook({
  onRunStart({ run }) {
    if (deployment.agentRunsDisabled) {
      return run.cancel('Agent runs are disabled in this environment.')
    }
  },
})
```

Attach the hook before calling `.send()` or `.stream()`:

```ts
const request = agent
  .prompt(message)
  .withHook(environmentGuard)
```

You do not call `run.cancel(...)` from the route. The `run` control exists only while Anvia invokes the hook.

## Catch cancellation at the runner

Cancellation raises `PromptCancelledError`. Catch it around the code that consumes the request:

```ts
import { PromptCancelledError } from '@anvia/core'

export async function runSupportAgent(input: {
  message: string
}) {
  try {
    return await agent
      .prompt(input.message)
      .withHook(environmentGuard)
      .send()
  } catch (error) {
    if (error instanceof PromptCancelledError) {
      return {
        output: 'This request cannot continue.',
        cancelled: true,
      }
    }

    throw error
  }
}
```

The hook owns the internal reason. The runner decides which user-facing response is safe to return.

## Cancel from a tool hook

Use `tool.cancel(...)` when one selected tool makes the entire run unsafe:

```ts
const policyHook = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'publish_release' && deployment.readOnly) {
      return tool.cancel('Publishing is disabled in read-only mode.')
    }
  },
})
```

Use `tool.skip(...)` instead when only that tool call should be rejected and the model may continue with another response.

## Know what cancellation means

Hook cancellation prevents future turns and tool calls. It does not undo a side effect completed before cancellation, so write tools still need idempotency, transactions where appropriate, and audit records.

Keep these cancellation paths separate:

| Situation | Mechanism |
| --- | --- |
| Runtime policy rejects the run | `run.cancel(...)` or `tool.cancel(...)` |
| One tool should not execute | `tool.skip(...)` |
| User presses Stop in a streaming UI | Abort the client request; see [Errors and cancellation](/sdk/streaming/errors-and-cancellation) |
| Provider or service fails | Handle the original error; do not disguise it as policy cancellation |

Tests should assert both the cancellation reason and that forbidden tools were never called.
