# Errors and cancellation

Handle stream failures at the consumer boundary and cancel work when its output is no longer needed.

## 1. Handle an agent failure once

An agent stream yields an `error` event with cumulative usage, then the iterator completes normally. The same failure rejects the `stream.result` promise, so funnel the awaited result through the same try/catch:

```ts
const stream = agent.stream({ prompt: message })

try {
  for await (const event of stream) {
    if (event.type === 'error') {
      await logger.error('Agent stream failed', {
        error: event.error,
        usage: event.usage,
      })

      continue
    }

    await handleRuntimeEvent(event)
  }

  await stream.result
} catch (error) {
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
  body: JSON.stringify({ type: 'messages', messages }),
  signal: controller.signal,
})

// Call this from the Stop button handler.
controller.abort()
```

Aborting `fetch()` cancels the response body even after headers have arrived.

For a normal `createClientStreamResponse()` response, cancellation calls `return()` on the event
iterator. Closing an active `AgentStream` cancels its run. Server-side owners can also cancel the
handle directly:

```ts
const stream = agent.stream({ prompt: message })
stream.cancel('The caller no longer needs this run.')
```

Cancellation does not undo completed tool calls, writes, or external side effects. Long-running application work needs its own cancellation and cleanup design.

A [resumable stream](/sdk/streaming/resumable-streams) intentionally keeps draining and storing the original run after the response reader disconnects.

## 5. Serialize terminal errors safely as JSONL

`toReadableStream()` from `@anvia/core/streaming` converts an async iterable into a JSONL `ReadableStream<Uint8Array>` for a custom HTTP route. By default, yielded values use ordinary `JSON.stringify`, so a yielded `Error` becomes `{}`, and a thrown error is written as one `{ type: 'error', error }` line with its name, message, and well-known `code` and `details` fields.

Pass `errorSerialization: 'anvia'` to opt in to a minimized terminal envelope:

```ts
import { toReadableStream } from '@anvia/core/streaming'

const body = toReadableStream(agent.stream({ prompt: message }), {
  errorSerialization: 'anvia',
})

return new Response(body, {
  headers: { 'Content-Type': 'application/x-ndjson' },
})
```

With this policy, a top-level `type: 'error'` event or an iterator failure becomes a fresh line containing only `type`, `error`, and optional `usage`, and the stream then closes:

- `error` keeps string `name` and `message` values and finite scalar `code` values, including data properties inherited from an error prototype. Recognized completion provider-output errors also keep `kind`, `toolCallId`, and a normalized `finishReason`.
- Stack traces, `cause`, arbitrary `details`, raw provider payloads, and extra envelope fields are omitted. Getters, `toJSON`, and coercion methods are never called.
- Strings, finite numbers, booleans, and `null` stay primitive error values. A BigInt becomes `{ message: '42' }`, and any value without supported diagnostics becomes `{ message: 'Unknown error' }`.
- `usage` is kept only when all five token counters and any numeric `details` are finite and non-negative; otherwise it is omitted without changing the error.

The terminal line is written once and the source iterator is finished once. Cancelling the response body suppresses pending iterator results and requests cleanup once. A noncooperative iterator can still hold its own pending work or delay cleanup. Successful events and nested data keep ordinary JSON serialization.

This policy limits which fields are exposed; it does not redact secrets inside the allowed `message` or other diagnostics. Keep sanitizing errors at your boundary, for example with `mapError` in `createClientStreamResponse()`.
