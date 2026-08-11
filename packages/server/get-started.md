# Get started

Install Server beside Core in the process that exposes your HTTP route.

```sh
pnpm add @anvia/server @anvia/core
```

Create the prompt request separately, then pass its events into the response helper:

```ts
import type { UIStreamRequest } from '@anvia/core/ui'
import { createEventStream } from '@anvia/server'
import { supportAgent } from './support-agent'

export async function POST(request: Request) {
  const body = (await request.json()) as UIStreamRequest
  const promptRequest = supportAgent.prompt(body.messages)

  return createEventStream(promptRequest.stream(), {
    format: 'jsonl',
  })
}
```

The package uses standard `Request`, `Response`, and Web Streams types, so it is not coupled to a specific router. The hosting framework must return the `Response` without consuming or buffering its body.

JSONL is the default and matches the default `@anvia/react` transport. Use SSE only when the client requires `text/event-stream`.

Server does not authenticate the route, validate session ownership, impose rate limits, or construct the agent. Do that before creating the prompt request.

Continue with [transports](/packages/server/transports), [streaming behavior](/packages/server/streaming), and [deployment](/packages/server/deployment).
