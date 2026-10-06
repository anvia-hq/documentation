# Server transport

`@anvia/client` defines the browser-safe protocol and maps runtime events into it. `@anvia/server` frames those client events and returns a JSONL or SSE `Response`.

## Return an agent stream

```ts
import { agentToClientStream, parseClientStreamRequest } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())
  if (body.type !== 'messages') {
    return new Response('Interaction responses are not enabled', { status: 400 })
  }
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
    if (event.type === 'response') yield { type: 'done', output: event.output }
    if (event.type === 'interaction') yield { type: 'interaction', request: event.interaction }
    if (event.type === 'blocked') yield { type: 'blocked', reason: event.reason }
  }
}

return createEventStreamResponse({ events: publicEvents(), format: 'jsonl' })
```

Do not send raw runtime events to an untrusted browser. They can contain prompts, reasoning, tool input/output, provider data, and internal errors.

Next, handle [errors and cancellation](/sdk/streaming/errors-and-cancellation).

## Consume a custom event stream

The generic client transport pairs with an application event protocol. This offline example
validates events using `mapEvent`; replace the fake fetch with your actual endpoint transport:

```ts anvia-check generic-transport-example
import { createFetchEventTransport, EventStreamHttpError } from '@anvia/client/transport'
import { z } from 'zod'

const eventSchema = z.object({ type: z.literal('progress'), completed: z.number().int().nonnegative() })
type Progress = z.infer<typeof eventSchema>
const fakeFetch: typeof fetch = async () => new Response(
  'data: {"type":"progress","completed":1}\n\n',
  { headers: { 'content-type': 'text/event-stream' } },
)
const transport = createFetchEventTransport<{ jobId: string }, Progress>({
  endpoint: ({ request }) => `https://example.invalid/jobs/${encodeURIComponent(request.jobId)}`,
  headers: () => ({ 'x-demo-client': 'progress' }),
  fetch: fakeFetch,
  mapEvent: (event) => eventSchema.parse(event),
  validateResponse: (response) => {
    if (!response.headers.get('content-type')?.includes('text/event-stream')) {
      throw new Error('Expected SSE')
    }
  },
})
const controller = new AbortController()
const received: Progress[] = []
try {
  for await (const event of transport.send({ request: { jobId: 'demo' }, abortSignal: controller.signal })) {
    received.push(event)
  }
} catch (error) {
  if (error instanceof EventStreamHttpError) {
    console.log('HTTP status', error.response.status)
  }
  throw error
}
console.log(received) // [{ type: 'progress', completed: 1 }]
```

Call `controller.abort()` from your cancellation owner. Breaking out of the loop cancels its body
reader. Neither action reverses completed server operations. For JSONL, use the same mapper and
`format: 'jsonl'`, or let content-type auto-detection select it.

Generic events carry no Anvia frame sequencing or stream-identity guarantees. The
[client transport reference](/packages/client/api-reference#generic-event-transport-reference)
explains lower-level readers, direct handlers, and response validation options.
