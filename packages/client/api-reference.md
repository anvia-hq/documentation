# `@anvia/client` API reference

## Protocol adapters

```ts
import {
  agentToClientStream,
  completionToClientStream,
  customAgentEventsToClientStream,
} from '@anvia/client'
```

These functions project native Core events into public `ClientStreamEvent` values. Configure explicit output and error mapping when application values are not safe JSON client data.

## Validation

```ts
import {
  parseClientStreamRequest,
  parseClientStreamEvent,
  parseClientStreamFrame,
  parseUIMessage,
  parseUIMessages,
} from '@anvia/client'
```

Use runtime parsers at every untrusted network or persistence boundary.

## Transports

```ts
import {
  createDirectClientTransport,
  createHttpClientTransport,
} from '@anvia/client'
```

`createHttpClientTransport({ endpoint, format, headers, body, fetch, init, metadataSchema, dataSchemas })` supports framed JSONL or SSE. `createDirectClientTransport({ handler })` retains the same framed contract in process.

Low-level generic event readers and transports live at `@anvia/client/transport`; they do not imply the Anvia client protocol.

## Messages and reducer

```ts
import {
  applyClientStreamEvent,
  assistantText,
  createClientId,
  messagesToUIMessages,
  messageText,
  uiMessagesToMessages,
} from '@anvia/client'
```

Public types include `ClientStreamRequest`, `ClientStreamEvent`, `ClientStreamFrame`, `ClientInteraction`, `ClientTransport`, `UIMessage`, `UIMessagePart`, attachments, errors, metadata, data maps, and cursors. `CLIENT_STREAM_PROTOCOL` is the current protocol identifier.
