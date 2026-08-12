# Cancellation

**Type:** Recipe

## Outcome

Stop consuming an Anvia stream when the user clicks Stop, and use run-control hooks when policy must
cancel before a provider or tool step. These are different boundaries and should be implemented
deliberately.

## Prerequisites

- A streaming-capable agent built from [First agent](../essentials/first-agent)
- Ownership of the `ReadableStream` in the code that handles the stop action

## Cancel from the consumer

Create the stream and retain the same object where your stop handler can reach it:

```ts
const promptRequest = agent.prompt(userMessage)
const stream = promptRequest.readableStream()

stopButton.addEventListener('click', () => {
  void stream.cancel('User stopped the run')
})

return new Response(stream, {
  headers: { 'content-type': 'application/x-ndjson' },
})
```

If the HTTP framework owns or locks the body, connect its disconnect callback at the framework
boundary instead of trying to recover the stream later. `cancel()` closes consumption by returning
the underlying async iterator; it is not a promise that every provider has already stopped billing
or that a tool side effect was rolled back.

## Cancel from policy

```ts
import { createHook } from '@anvia/core/hooks'
import { PromptCancelledError } from '@anvia/core/request'

const policy = createHook({
  onToolCall({ toolName, tool }) {
    if (toolName === 'delete_account') return tool.cancel('Deletion is disabled.')
    return tool.run()
  },
})

try {
  await agent.prompt(userMessage).withHook(policy).send()
} catch (error) {
  if (!(error instanceof PromptCancelledError)) throw error
  console.log(error.reason)
}
```

## Expected behavior

Consumer cancellation stops further stream delivery. Hook cancellation rejects the prompt with
`PromptCancelledError` before the blocked handler executes. Neither mechanism reverses side
effects that completed earlier.

## Boundaries

Design tools for cancellation explicitly: use idempotency keys, pass abort signals through your own
service APIs where supported, and record whether an operation was requested, committed, or unknown.
Never report “cancelled” as “rolled back.” In production, test disconnect behavior on the actual
runtime and reconcile operations whose final status is uncertain.

## Source and extensions

Cancellation behavior is implemented by
[`PromptRequest.readableStream()`](https://github.com/anvia-hq/anvia/blob/main/packages/core/src/request/prompt-request.ts)
and demonstrated through hook control in the
[permission cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/08-tool-permission-hook.ts).
Next, add an operation-status endpoint and recovery UI.

- [Hook cancellation](/sdk/advanced/hooks/cancellation)
- [Streaming cancellation](/sdk/streaming/errors-and-cancellation)
