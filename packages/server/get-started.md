# Get started

Install Server with Core and the framework-neutral client protocol:

```sh
pnpm add @anvia/core @anvia/client @anvia/server
```

```ts
import { agentToClientStream, parseClientStreamRequest } from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'
import { supportAgent } from './support-agent'

export async function POST(request: Request) {
  const body = parseClientStreamRequest(await request.json())

  return createClientStreamResponse({
    events: agentToClientStream({
      events: supportAgent.stream({ messages: body.messages }),
      ...(body.metadata === undefined ? {} : { metadata: body.metadata }),
    }),
    format: 'jsonl',
  })
}
```

The package uses standard Request, Response, and Web Streams types, so it is router-independent. JSONL is the default and pairs with `createHttpClientTransport({ format: 'jsonl' })` from `@anvia/client`.

Authenticate the caller and apply rate limits before starting the agent. Runtime events can contain sensitive values; project them through `agentToClientStream()` and configure its error/output mapping rather than serializing raw errors to a public client.

Continue with [transports](/packages/server/transports), [streaming behavior](/packages/server/streaming), and [deployment](/packages/server/deployment).
