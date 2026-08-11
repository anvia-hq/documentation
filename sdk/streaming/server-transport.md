# Server transport

Use `@anvia/server` to convert an async event iterable into an HTTP `Response` with streaming headers and serialization.

## Return JSONL

```ts
import type { UIStreamRequest } from '@anvia/core'
import { createEventStream } from '@anvia/server'

export async function POST(request: Request) {
  const body = (await request.json()) as UIStreamRequest
  const promptRequest = agent.prompt(body.messages)
  const events = promptRequest.stream()

  return createEventStream(events, { format: 'jsonl' })
}
```

JSONL is the default. Each event is serialized as one JSON object followed by a newline, with `application/x-ndjson` response content.

Use SSE when a client expects `text/event-stream`:

```ts
const promptRequest = agent.prompt(body.messages)
const events = promptRequest.stream()

return createEventStream(events, {
  format: 'sse',
})
```

## Project client-safe events

Do not expose raw runtime events without reviewing their contents.

```ts
import type { PromptRequest } from '@anvia/core'

async function* clientEvents(request: PromptRequest) {
  for await (const event of request.stream()) {
    if (event.type === 'text_delta') {
      yield { type: 'text', delta: event.delta }
    }
    if (event.type === 'tool_call') {
      yield { type: 'status', label: 'Checking data' }
    }
    if (event.type === 'final') {
      yield { type: 'done', output: event.output }
    }
  }
}

const promptRequest = agent.prompt('Explain the latest invoice.')
return createEventStream(clientEvents(promptRequest))
```

Keep credentials and agent execution on the server. Tool arguments, results, reasoning, and provider metadata can contain private application data.

Use `promptRequest.readableStream()` directly only when a small custom route intentionally exposes its JSONL runtime-event shape.
