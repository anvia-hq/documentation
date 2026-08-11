# Errors and cancellation

Wrap stream consumption at the runner boundary. An agent stream yields an `error` event and then throws the same failure on its next read.

## Handle an agent failure once

```ts
let failedUsage

try {
  for await (const event of promptRequest.stream()) {
    if (event.type === 'error') {
      failedUsage = event.usage
    } else {
      await handleRuntimeEvent(event)
    }
  }
} catch (error) {
  await logger.error('Agent stream failed', {
    error,
    usage: failedUsage,
  })

  await ui.fail('The request could not be completed.')
}
```

Error usage is cumulative across completed turns and provider attempts that reported authoritative usage. It is empty when the runtime received no authoritative usage.

## Retry only before output starts

```ts
const request = agent
  .prompt(message)
  .withCompletionRetries({
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 1_000,
  })
```

For streaming runs, Anvia retries a failed model invocation only before it emits any non-error provider event. This avoids duplicating output already observed by the caller.

## Who owns cancellation

In a normal web application, the client owns the Stop action. The server returns the stream and does not call `stream.cancel()` itself.

## Stop from React

`useChat` already owns an `AbortController`. Connect its `stop()` method to the UI:

```tsx
import { useChat } from '@anvia/react'

const chat = useChat({ endpoint: '/api/chat' })

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

`chat.stop()` aborts the active HTTP request and returns the controller to the idle state.

## Stop from a custom browser client

When calling `fetch(...)` directly, keep its `AbortController` beside the code that owns the Stop button:

```ts
const controller = new AbortController()

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, stream: true }),
  signal: controller.signal,
})

// Run this from the Stop button handler.
controller.abort()
```

Aborting the fetch cancels its response body even after the response headers have arrived.

## What the server does

The route only creates and returns the response:

```ts
import type { UIStreamRequest } from '@anvia/core'
import { createEventStream } from '@anvia/server'

export async function POST(request: Request) {
  const body = (await request.json()) as UIStreamRequest
  const promptRequest = agent.prompt(body.messages)
  const events = promptRequest.stream()

  return createEventStream(events)
}
```

For a normal stream, a browser abort or disconnect causes the server response body to be cancelled. `createEventStream(...)` then calls `return()` on the agent event iterator. There is no separate `stream.cancel()` line to add to this route.

A [resumable stream](/sdk/streaming/resumable-streams) behaves differently: its server wrapper intentionally keeps consuming and storing events so the client can reconnect later.

Cancellation stops stream consumption. It does not undo completed tool calls or product writes. Long-running application work needs its own cancellation and cleanup path.
