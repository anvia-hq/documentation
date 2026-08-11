# Completion streams

Use `createCompletionStream(...)` when one direct model call should yield provider-neutral events as they arrive.

## Stream text

```ts
import { createCompletionStream } from '@anvia/core'

const events = createCompletionStream(model, {
  instructions: 'Write clearly and concisely.',
  input: 'Write a short launch note for Anvia.',
})

for await (const event of events) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log('\nTokens:', event.response.usage.totalTokens)
  }
}
```

The stream finishes with a `final` event containing the normalized completion response.

## What it can emit

Besides text, a provider may emit reasoning deltas, tool-call deltas, completed tool calls, sources, provider-executed tool calls, a message ID, a final response, or an error.

Direct completion streaming does not execute local tools or continue an agent loop. Use an [agent stream](/sdk/streaming/agent-streams) when tool calls should run and feed results back to the model.

## Check capability support

The selected model must support streaming and every optional request feature. Anvia throws `CompletionCapabilityError` before transport when the request is incompatible with the model.
