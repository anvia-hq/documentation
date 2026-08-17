# Cancellation

Cancellation stops future work when a stream's output is no longer needed. It does not undo model usage or tool side effects that already completed.

## Stop from React

`useChat` owns the active request and exposes `stop()`:

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

## Stop a custom browser request

```ts
const controller = new AbortController()

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages }),
  signal: controller.signal,
})

// Call this from the Stop button.
controller.abort()
```

For a normal `createClientStreamResponse()` response, disconnecting closes the event iterator. Closing an active `AgentStream` cancels its run. There is no separate public `stream.cancel()` method.

## Handle uncertain side effects

Stopping prevents future turns and tool calls, but a write may already have reached an external service. Design write tools with authorization, idempotency keys, transactional boundaries where possible, and an operation-status record that can reconcile an uncertain result.

Do not report “cancelled” as “rolled back.” A resumable stream intentionally behaves differently: it keeps draining and storing the original run after the reader disconnects.

Continue with [streaming errors and cancellation](/sdk/streaming/errors-and-cancellation) and [resumable streams](/sdk/streaming/resumable-streams).
