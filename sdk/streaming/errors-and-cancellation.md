# Errors and cancellation

Handle stream failures at the consumer boundary and cancel work when its output is no longer needed.

## 1. Handle an agent failure once

An agent stream yields an `error` event with cumulative usage, then throws the same failure when the iterator advances:

```ts
let failedUsage

try {
  for await (const event of agent.stream({
      prompt: message
  })) {
    if (event.type === 'error') {
      failedUsage = event.usage
      continue
    }

    await handleRuntimeEvent(event)
  }
} catch (error) {
  await logger.error('Agent stream failed', {
    error,
    usage: failedUsage,
  })

  await ui.fail('The request could not be completed.')
}
```

Usage includes completed turns and provider attempts that reported authoritative usage. It is empty when no authoritative usage was received.

## 2. Configure safe streaming retries

Pass retries with the stream run options:

```ts
const stream = agent.stream({
    prompt: message,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
    }
})
```

Anvia retries a failed model invocation only before that invocation exposes provider progress. Once a delta or other non-error provider event is visible, retrying could duplicate output and is disabled.

## 3. Stop from React

`useChat` owns an `AbortController`. Connect its `stop()` method to the interface:

```tsx
import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'

const transport = createHttpClientTransport({ endpoint: '/api/chat', format: 'jsonl' })
const chat = useChat({ transport })

return (
  <button
    type="button"
    disabled={chat.status !== 'streaming'}
    onClick={() => chat.stop()}
  >
    Stop
  </button>
)
```

Stopping aborts the active HTTP request and returns the hook to its `ready` state.

## 4. Stop from a custom browser client

```ts
const controller = new AbortController()

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages }),
  signal: controller.signal,
})

// Call this from the Stop button handler.
controller.abort()
```

Aborting `fetch()` cancels the response body even after headers have arrived.

For a normal `createClientStreamResponse()` response, cancellation calls `return()` on the event iterator. Closing an active `AgentStream` cancels its run. There is no separate public `stream.cancel()` method.

Cancellation does not undo completed tool calls, writes, or external side effects. Long-running application work needs its own cancellation and cleanup design.

A [resumable stream](/sdk/streaming/resumable-streams) intentionally keeps draining and storing the original run after the response reader disconnects.
