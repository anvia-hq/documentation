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
  isJsonValue,
  parseClientStreamRequest,
  parseClientStreamEvent,
  parseClientStreamFrame,
  parseUIMessage,
  parseUIMessages,
} from '@anvia/client'
```

Use runtime parsers at every untrusted network or persistence boundary. `isJsonValue` is the same JSON-safety guard the client protocol uses, exported so server and application serializers can validate payloads with identical rules.

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

## Generic event transport reference

Import from `@anvia/client/transport`. These APIs operate on your own event schema:

| API | Signature and behavior |
| --- | --- |
| `createFetchEventTransport<TRequest, TEvent>(options)` | Returns `EventTransport<TRequest, TEvent>`; `send({ request, abortSignal?, headers? })` yields an async iterable. |
| `createDirectEventTransport<TRequest, TEvent>({ handler })` | Runs `handler(context): AsyncIterable<TEvent>` in process; closes its iterator on exit/abort. |
| `fetchEventStream<TEvent>(options)` | Async iterable using `input` (string, URL, or Request), ordinary fetch init fields, optional `fetch`, `format`, and `validateResponse`. |
| `readJsonlStream<TEvent>(stream)` | Async iterable reading JSON values from `ReadableStream<Uint8Array>` lines. |
| `readSseStream<TEvent>(stream)` | Async iterable parsing joined SSE `data:` lines as JSON; comments and other SSE fields are ignored. |
| `EventStreamHttpError` | Non-success HTTP status; exposes `response: Response` and `body: string`. |

Fetch transport options include `endpoint` (string/URL or a synchronous context callback), `headers`
(static or async callback), `body` (async callback receiving context and merged `Headers`), `method`,
`init`, `fetch`, `format: 'auto' | 'jsonl' | 'sse'`, `mapEvent(unknown)`, and
`validateResponse(Response)`. Send-time headers override configured headers. The default method is
POST with a JSON request body and an application/json header if absent; GET/HEAD have no default
body. A custom body callback owns body encoding and its content type.

Auto format uses SSE only when content type contains `text/event-stream`; everything else is
JSONL. Non-2xx status is checked before `validateResponse`, which may reject an otherwise successful
response. A missing response body is an error.

Readers parse JSON and cast it to `TEvent`: a generic type argument is not schema validation.
Use `mapEvent` to validate every event. Invalid JSON throws `SyntaxError`; a mapper may throw its
own validation error. Readers cancel the body on early return or parsing failure and release the
reader lock. HTTP abort is forwarded to fetch; direct handlers must also observe the signal during
long operations because an iterator cannot interrupt arbitrary work by itself.

Use `createHttpClientTransport` for Anvia framed protocol validation and React message state. See a
[complete generic stream consumer](/sdk/streaming/server-transport#consume-a-custom-event-stream).
