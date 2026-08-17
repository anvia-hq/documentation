# `@anvia/server`

`@anvia/server` turns asynchronous events into Fetch `Response` streams. Its client-protocol helper works with `@anvia/client` and `@anvia/react`; generic helpers also support application-defined JSONL or SSE events.

## Install

```sh
pnpm add @anvia/core @anvia/client @anvia/server
```

## Return an agent stream

```ts
import { agentToClientStream, parseClientStreamRequest } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'
import { supportAgent } from './support-agent'

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())
  const events = supportAgent.stream({ messages: body.messages })

  return createClientStreamResponse({
    events: agentToClientStream({
      events,
      ...(body.metadata === undefined ? {} : { metadata: body.metadata }),
    }),
    format: 'jsonl',
  })
}
```

`parseClientStreamRequest()` validates the public request shape. `agentToClientStream()` maps runtime events into the stable client protocol, and `createClientStreamResponse()` frames and serializes them.

## Key features

- `createClientStreamResponse` and `resumeClientStreamResponse` serve the Anvia client protocol.
- `createEventStreamResponse` and `resumeEventStreamResponse` transport generic application events.
- `createJsonlStream` and `createSseStream` expose lower-level encoders.
- `createResumableStream` persists generic event envelopes for replay.
- `createMemoryResumableStreamStore` is useful for tests and single-process development.

The package does not authenticate routes, authorize resume cursors, construct agents, or decide which runtime data is safe for a browser. Enforce those boundaries before starting a run.

## Runtime compatibility

The package is ESM and uses standard `Response`, `ReadableStream`, `TextEncoder`, and `Headers` APIs. Hosting platforms differ in buffering and execution limits, so verify streaming in the actual deployment environment.

Continue with [Server transport](/sdk/streaming/server-transport), [Resumable streams](/sdk/streaming/resumable-streams), or the [API reference](/packages/server/api-reference).
