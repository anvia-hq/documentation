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

## Durable chat transport

```ts
import {
  DurableBusyError,
  createDurableChatTransport,
  type CreateDurableChatTransportOptions,
  type DurableChatClient,
  type DurableChatController,
  type DurableChatTransport,
} from '@anvia/client/durable-chat'
```

`createDurableChatTransport({ client, agentId, sessionId, requestId?, enqueue? })` returns a `ClientTransport<ClientStreamRequest>` with a `controller`. It submits the last user message to `@anvia/durable`, maps journal events to `anvia.client.v3` frames, routes interaction responses to the active run, and resumes from a durable run ID plus sequence. The same entry point re-exports `ClientStreamCursor`.

`DurableChatClient` is the structural subset of `DurableClient` the adapter needs: `submit`, `stream`, `snapshot`, `respond`, `resolveTool`, `retry`, `cancel`, and `listRuns`, plus optional `steer` and `resolveMemoryWrite`. A custom implementation must provide `snapshot`, which the adapter reads when a settled status event omits the outcome. `DurableChatController` exposes `activeRunId`, `status`, `subscribe(listener)`, `reattach(runId, after?)`, `steer(input, runId?)`, `cancel(runId?)`, `retry(runId?)`, `resolveTool(operationId, output, runId?)`, and `resolveMemoryWrite(operationKey, resolution, runId?)`. `DurableBusyError` reports a 409 busy session and carries `code: 'session_busy'` plus a best-effort `runId`.

The pure event projection (`mapDurableChatEvent`, `createDurableChatMapState`, and `durableChatMessageId`) is internal in 1.7.0. It is not exported from `@anvia/client/durable-chat`; import only the public names above.

See [Durable chat transport](/packages/client/durable-chat) for setup, event mapping, resume, and limitations.

## Durable HTTP client

```ts
import { DurableClient, DurableHttpError } from '@anvia/client/durable'
```

`DurableHttpError` exposes the HTTP failure as `status`, `code?`, `field?`, and `message`. `code` and `field` come from the server's `{ error, code, field? }` body when present; non-JSON, empty, or oversized bodies fall back to a status-based message. A `payload_too_large` response is HTTP 413; `capacity_exceeded` is HTTP 429. Both are best-effort: use `status` when an older server does not send the structured body.

`DurableClient` validates incoming snapshots and events and never retries mutations automatically. Request options accept `abortSignal`; aborting a stream detaches that subscriber without cancelling the run. See [HTTP server and client](/packages/durable/http#browser-client).

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

The reducer keeps an optional, validated `contextBreakdown` from `message_end`, `turn_end`, and `run_end` events on the assistant message's `generation`, and `messagesToUIMessages()` restores it when hydrating history.

## Generic event transport reference

Import from `@anvia/client/transport`. These APIs operate on your own event schema:

| API | Signature and behavior |
| --- | --- |
| `createFetchEventTransport<TRequest, TEvent>(options)` | Returns `EventTransport<TRequest, TEvent>`; `send({ request, abortSignal?, headers? })` yields an async iterable. Accepts `onParseError`. |
| `createDirectEventTransport<TRequest, TEvent>({ handler })` | Runs `handler(context): AsyncIterable<TEvent>` in process; closes its iterator on exit/abort. |
| `fetchEventStream<TEvent>(options)` | Async iterable using `input` (string, URL, or Request), ordinary fetch init fields, optional `fetch`, `format`, `validateResponse`, and `onParseError`. |
| `readJsonlStream<TEvent>(stream, options?)` | Async iterable reading JSON values from `ReadableStream<Uint8Array>` lines. |
| `readSseStream<TEvent>(stream, options?)` | Async iterable yielding the parsed JSON `data` of each SSE frame. |
| `readSseFrames<TEvent>(stream, options?)` | Async iterable yielding `SseFrame<TEvent>` with `data`, `event`, `lastEventId`, and optional `retry`. |
| `EventStreamParseError` | Malformed JSONL line or SSE data payload; exposes `format`, `raw`, `line?`, `event?`, `lastEventId?`, and the parse `cause`. |
| `EventStreamHttpError` | Non-success HTTP status; exposes `response: Response` and `body: string`. |

`EventStreamReadOptions` controls malformed frames. By default a frame whose payload is not valid JSON is skipped and passed to `onParseError(error)`. Throwing from that callback aborts the stream with the thrown value. Set `strict: true` to throw `EventStreamParseError` instead of skipping. `createHttpClientTransport` forwards `onParseError`; `DurableClient` streams always use strict parsing because skipping a durable event would leave an undetectable cursor gap.

SSE parsing follows the event-stream format: `event`, `id`, `retry`, multi-line `data`, comments, one optional space after the colon, and CRLF, LF, or bare-CR line endings across chunk boundaries. `readSseFrames` exposes the event name, last event ID, and retry hint; `readSseStream` yields only `data`. Whitespace-only data frames are ignored.

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
Use `mapEvent` to validate every event. Malformed JSON is skipped and reported through
`onParseError` unless `strict: true` is set; a mapper may throw its own validation error. Readers
cancel the body on early return, a throwing callback, or a strict parse failure and release the
reader lock. HTTP abort is forwarded to fetch; direct handlers must also observe the signal during
long operations because an iterator cannot interrupt arbitrary work by itself.

Use `createHttpClientTransport` for Anvia framed protocol validation and React message state. See a
[complete generic stream consumer](/sdk/streaming/server-transport#consume-a-custom-event-stream).
