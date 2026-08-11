# Resumable streams

A resumable stream lets a client reconnect to the same running agent stream after a reload, navigation, or temporary network failure.

Resuming does not start another agent run. The server replays events the client missed, then continues delivering live events from the original run.

## The lifecycle

```text
Start request
  → server creates streamId
  → events are stored with increasing eventId values
  → client renders events and remembers the latest eventId

Connection drops
  → resumable wrapper keeps consuming the agent run on the server
  → new events continue to be stored

Resume request { streamId, after }
  → server replays events after that cursor
  → server tails new live events
  → stream_end closes the stream
```

Four values make this work:

| Value | Purpose |
| --- | --- |
| `streamId` | Stable identifier for one running stream. |
| `eventId` | Increasing position assigned to each stored event. |
| Store | Persists events and exposes replay plus live subscription. |
| `after` | Last event the client successfully applied. |

## What travels over the wire

Anvia wraps normal runtime events in a small resumable protocol:

```json
{"type":"stream_start","streamId":"run_123","eventId":0}
{"type":"stream_event","streamId":"run_123","eventId":1,"event":{"type":"text_delta","turn":1,"delta":"Hello"}}
{"type":"stream_end","streamId":"run_123","eventId":42,"status":"completed"}
```

The client stores `eventId: 1` after applying the second line. If it reconnects with `after: 1`, the server begins at event 2 rather than repeating already-applied output.

## Start and resume through one route

`UIStreamRequest` already includes the optional resume cursor:

```ts
type UIStreamRequest = {
  messages: Message[]
  stream: true
  metadata?: JsonValue
  resume?: {
    streamId: string
    after: number
  }
}
```

The same POST endpoint handles two paths:

- no `resume`: start an agent run and create a resumable stream
- with `resume`: replay and follow an existing stream without calling the agent again

```ts
import type { Message } from '@anvia/core'
import type { UIStreamRequest } from '@anvia/core/ui'
import {
  createEventStream,
  createMemoryResumableStreamStore,
} from '@anvia/server'

const resumableStore = createMemoryResumableStreamStore()

function latestUserMessage(messages: Message[]): Message {
  const message = messages.at(-1)

  if (message?.role !== 'user') {
    throw new Error('Expected the latest message to be from the user.')
  }

  return message
}

export async function POST(request: Request) {
  const body = (await request.json()) as UIStreamRequest

  if (body.resume) {
    return createEventStream({
      format: 'jsonl',
      resume: {
        streamId: body.resume.streamId,
        after: body.resume.after,
        store: resumableStore,
      },
    })
  }

  const streamId = crypto.randomUUID()
  const promptRequest = agent.prompt(latestUserMessage(body.messages))
  const events = promptRequest.stream()

  return createEventStream(events, {
    format: 'jsonl',
    resumable: {
      id: streamId,
      store: resumableStore,
    },
  })
}
```

The store lives outside the route so later requests can find the same stream. Validate the JSON body and authorize both paths in production.

The initial `createEventStream(...)` call keeps draining the agent iterable into the resumable store even if its response reader disconnects. The resume path reads the stored events after `after`, then waits for new records until the run closes.

## Client behavior

With `@anvia/react`, enable resume with a stable key for the conversation:

```tsx
import { useChat } from '@anvia/react'

const chat = useChat({
  endpoint: `/api/threads/${threadId}/chat`,
  resume: {
    key: threadId,
  },
})
```

By default, the hook stores the active stream ID, last applied event ID, and current UI messages in `sessionStorage`. When the component mounts again, it posts a resume request to the same endpoint:

```json
{
  "messages": [],
  "stream": true,
  "resume": {
    "streamId": "run_123",
    "after": 17
  }
}
```

`useChat` unwraps `stream_event` envelopes before updating UI state, so components continue to receive normal Anvia events.

Use `storage: 'localStorage'` when the cursor should survive a browser session. Set `auto: false` when the product should wait for an explicit `chat.resume()` call.

## Use a durable production store

`createMemoryResumableStreamStore()` is only for tests and single-process development. It loses events on restart and cannot coordinate several server processes.

A production `ResumableStreamStore` normally uses Redis, Postgres, or the workflow system that owns the running job:

| Operation | Responsibility |
| --- | --- |
| `open(...)` | Create or return the initial stream state. |
| `append(...)` | Persist the next event with an ordered ID. |
| `subscribe(...)` | Replay records after a cursor, then continue yielding live records. |
| `status(...)` | Return whether the stream is running, completed, missing, or failed. |
| `close(...)` | Mark the stream completed or errored. |

`subscribe(...)` is the critical operation: replay first, tail second, finish only after the stream closes.

## Security and retention

A resume cursor is a transport position, not proof of access. Authenticate the request and verify that `streamId` belongs to the current user, thread, and tenant before replaying anything.

Use resumable storage for transport recovery and [memory](/sdk/memory) for future model context. They are not interchangeable.

Stored events may contain prompts, tool arguments, tool results, reasoning, and errors. Apply redaction and short retention appropriate to the product surface.
