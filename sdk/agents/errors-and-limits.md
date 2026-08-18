# Errors and limits

Bound every production agent and translate runtime failures at the application boundary. Do not expose raw provider, tool, retrieval, memory, or lifecycle errors directly to users.

## 1. Set a turn limit

The agent constructor defines the default, and one run can override it:

```ts
const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Use tools only when needed.',
  maxTurns: 4,
})

const result = await supportAgent.generate({
    prompt: input.message,
    maxTurns: 2
})
```

`maxTurns` must be a nonnegative safe integer. When the model keeps requesting tools beyond the allowed loop, the run rejects with `MaxTurnsError`.

If runs frequently reach the limit, inspect instructions, tool descriptions, invalid tool inputs, and tool outputs before increasing it. More turns increase latency and cost and can hide a model-tool loop.

## 2. Handle exported agent errors

```ts
import {
  AgentRunCancelledError,
  MaxTurnsError,
} from '@anvia/core'

try {
  const result = await supportAgent.generate({
      prompt: input.message
  })
  return toProductResponse(result)
} catch (error) {
  if (error instanceof MaxTurnsError) {
    return {
      status: 503,
      message: 'The assistant could not finish this request safely.',
    }
  }

  if (error instanceof AgentRunCancelledError) {
    return {
      status: 409,
      message: safeCancellationMessage(error.reason),
    }
  }

  throw error
}
```

`MaxTurnsError` includes the configured limit, accumulated chat history, and last prompt. `AgentRunCancelledError` includes the accumulated history and cancellation reason. Keep those details in protected diagnostics unless they are known to be safe.

Other failures can come from unsupported model capabilities, provider authentication or validation, retrieval, memory, middleware, lifecycle callbacks, guardrails, or tool execution. Map them using application-specific error policy.

## 3. Treat approval as a result

Approval does not throw an error. It suspends the run:

```ts
let result = await supportAgent.generate({
    prompt: input.message
})

if (result.status === 'suspended' && result.interaction.type === 'tool-approval') {
  result = await supportAgent.generate({
    continuation: result.continuation,
    response: {
      type: 'tool-approval',
      approved: false,
      reason: 'The operator rejected this action.',
    },
  })
}
```

The suspended result contains the run ID, interaction, continuation, usage, and messages accumulated so far. Persist the trusted continuation before waiting for a human decision, and do not execute the protected action outside the runtime as a shortcut.

## 4. Retry transient model failures

Completion retries are opt-in per run:

```ts
const result = await supportAgent.generate({
    prompt: input.message,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
    }
})
```

Retries apply to the failed model invocation in its current turn. They do not restart the run or replay completed tools. The default policy covers common connection failures, rate limits, timeouts, conflicts, and server errors.

For streaming, Anvia retries only before provider progress has been exposed. Once output or another provider event has been observed, retrying could duplicate client-visible data, so the failure ends the stream.

Do not retry authentication, permission, invalid-request, schema, or deterministic application errors. Make side-effect tools idempotent before adding any wider request, queue, or job retry.

## 5. Handle stream errors

An agent stream emits an `error` event with accumulated usage and then rejects the iterator with the same run failure:

```ts
try {
  for await (const event of supportAgent.stream({
      prompt: input.message
  })) {
    if (event.type === 'error') {
      recordRunFailure(event.error, event.usage)
    }
  }
} catch (error) {
  return mapSupportError(error)
}
```

Centralize error mapping in the server or worker that owns the run. Return stable, product-safe messages to users and keep diagnostic details in protected logs, traces, or event records.
