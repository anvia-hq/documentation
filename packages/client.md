# `@anvia/client`

`@anvia/client` is Anvia's framework-neutral browser/server wire boundary. It owns protocol v3 request and event types, framed HTTP and in-process transports, conversion between Core messages and UI messages, and deterministic client-state reduction.

## Install

```sh
pnpm add @anvia/client @anvia/core
```

## Connect a typed transport

```ts
import { createHttpClientTransport } from '@anvia/client'

const transport = createHttpClientTransport({
  endpoint: '/api/chat',
  format: 'jsonl',
})

for await (const event of transport.send({
  request: {
    type: 'messages',
    messages: [{ role: 'user', content: 'Summarize the incident.' }],
  },
})) {
  console.log(event)
}
```

Most React applications pass this transport to `useChat()` instead of consuming it directly. Server routes validate requests with `parseClientStreamRequest()`, adapt Core events with `agentToClientStream()` or `completionToClientStream()`, and return them with `@anvia/server`.

## Protocol v3

An agent request is one of two explicit shapes:

- `messages` starts a run from Core messages;
- `interaction_response` responds to a pending approval or structured question by opaque interaction ID.

The matching `AgentContinuation` is trusted server state. It must never be serialized into the browser request.

Continue with [Get started](/packages/client/get-started), [protocol and state](/packages/client/protocol-and-state), or the [API reference](/packages/client/api-reference).
