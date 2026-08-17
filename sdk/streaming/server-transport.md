# Server transport

`@anvia/client` defines the browser-safe protocol and maps runtime events into it. `@anvia/server` frames those client events and returns a JSONL or SSE `Response`.

## Return an agent stream

```ts
import { agentToClientStream, parseClientStreamRequest } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())
  const events = agent.stream({ messages: body.messages })

  return createClientStreamResponse({
    events: agentToClientStream({
      events,
      ...(body.metadata === undefined ? {} : { metadata: body.metadata }),
      mapError: () => ({ message: 'The run failed', retryable: true }),
    }),
    format: 'jsonl',
  })
}
```

JSONL is the default. Use `format: 'sse'` on both `createClientStreamResponse()` and `createHttpClientTransport()` when the deployment requires Server-Sent Events.

Authenticate, authorize, rate-limit, and validate request ownership before creating the agent run. `parseClientStreamRequest()` validates protocol structure but does not authenticate the caller.

## Generic application events

For a protocol unrelated to Anvia React, use `createEventStreamResponse()`:

```ts
import { createEventStreamResponse } from '@anvia/server'

async function* publicEvents() {
  for await (const event of agent.stream({ prompt: 'Explain the latest invoice.' })) {
    if (event.type === 'text_delta') yield { type: 'text', delta: event.delta }
    if (event.type === 'tool_call') yield { type: 'status', label: 'Checking data' }
    if (event.type === 'final') yield { type: 'done', output: event.result.output }
  }
}

return createEventStreamResponse({ events: publicEvents(), format: 'jsonl' })
```

Do not send raw runtime events to an untrusted browser. They can contain prompts, reasoning, tool input/output, provider data, and internal errors.

Next, handle [errors and cancellation](/sdk/streaming/errors-and-cancellation).
