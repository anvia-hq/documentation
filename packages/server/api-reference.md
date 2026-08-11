# `@anvia/server` API reference

All JavaScript and TypeScript exports come from the package root:

```ts
import {
  createEventStream,
  createJsonlStream,
  createSseStream,
} from '@anvia/server'
```

The package currently has no deprecated or experimental public exports.

## Response helpers

### `createEventStream`

```ts
function createEventStream<TEvent>(
  events: AsyncIterable<TEvent>,
  options?: CreateEventStreamOptions<TEvent>,
): Response

function createEventStream<TEvent>(
  options: CreateEventStreamResumeOptions<TEvent>,
): Response
```

The first overload streams a new event source. The second replays and tails a stream stored under `resume.streamId`. Both return a standard Fetch `Response` with transport-appropriate headers.

```ts
type CreateEventStreamOptions<TEvent> = {
  format?: 'jsonl' | 'sse'
  headers?: HeadersInit
  status?: number
  statusText?: string
  resumable?: CreateResumableStreamOptions<TEvent>
  jsonl?: JsonlStreamOptions<TEvent>
  sse?: SseStreamOptions<TEvent>
}

type CreateEventStreamResumeOptions<TEvent> = {
  format?: 'jsonl' | 'sse'
  headers?: HeadersInit
  status?: number
  statusText?: string
  resume: {
    streamId: string
    after: number
    store: ResumableStreamStore<TEvent>
  }
  jsonl?: JsonlStreamOptions<ResumableStreamEnvelope<TEvent>>
  sse?: SseStreamOptions<ResumableStreamEnvelope<TEvent>>
}
```

`format` defaults to JSONL. Custom headers are merged into the response headers. A resumable new stream requires a unique `resumable.id` and a store.

### `createUIStreamResponse`

```ts
function createUIStreamResponse(
  events: AsyncIterable<UIStreamEvent>,
  options?: CreateEventStreamOptions<UIStreamEvent>,
): Response

function createUIStreamResponse(
  options: CreateEventStreamResumeOptions<UIStreamEvent>,
): Response
```

The UI-event-specific form of `createEventStream`. Its behavior is the same, but TypeScript restricts the event source and store to `UIStreamEvent`.

## Encoders

### `createJsonlStream`

```ts
function createJsonlStream<TEvent>(
  events: AsyncIterable<TEvent>,
  options?: JsonlStreamOptions<TEvent>,
): ReadableStream<Uint8Array>

type JsonlStreamOptions<TEvent> = {
  serialize?: (event: TEvent | EventStreamErrorEvent) => string
}
```

Encodes one JSON value per line. `serialize` can replace the default JSON serialization for normal and terminal error events.

### `createSseStream`

```ts
function createSseStream<TEvent>(
  events: AsyncIterable<TEvent>,
  options?: SseStreamOptions<TEvent>,
): ReadableStream<Uint8Array>

type SseStreamOptions<TEvent> = {
  eventName?: string | (
    (event: TEvent | EventStreamErrorEvent) => string | undefined
  )
  serialize?: (event: TEvent | EventStreamErrorEvent) => string
  retry?: number
}
```

Encodes JSON payloads as Server-Sent Events. `eventName` selects a static or per-event SSE event name, while `retry` writes the SSE reconnection delay in milliseconds.

## Resumable streams

### `createResumableStream`

```ts
function createResumableStream<TEvent>(
  events: AsyncIterable<TEvent>,
  options: CreateResumableStreamOptions<TEvent>,
): AsyncIterable<ResumableStreamEnvelope<TEvent>>

type CreateResumableStreamOptions<TEvent> = {
  id: string
  store: ResumableStreamStore<TEvent>
}
```

Opens a stream, persists events, and yields `stream_start`, `stream_event`, and `stream_end` envelopes. Event IDs are allocated by the store.

### `resumeStreamEvents`

```ts
function resumeStreamEvents<TEvent>(
  options: ResumeStreamEventsOptions<TEvent>,
): AsyncIterable<ResumableStreamEnvelope<TEvent>>

type ResumeStreamEventsOptions<TEvent> = {
  id: string
  after?: number
  store: ResumableStreamStore<TEvent>
}
```

Replays records after the supplied event ID and continues subscribing while the stream is running.

### `createMemoryResumableStreamStore`

```ts
function createMemoryResumableStreamStore<TEvent = unknown>():
  ResumableStreamStore<TEvent>
```

Creates a process-local store. It is not durable and is not shared between workers.

### `ResumableStreamStore`

```ts
interface ResumableStreamStore<TEvent = unknown> {
  open(input: ResumableStreamOpenInput): Promise<ResumableStreamState>
  append(
    input: ResumableStreamAppendInput<TEvent>,
  ): Promise<ResumableStreamRecord<TEvent>>
  subscribe(
    input: ResumableStreamSubscribeInput,
  ): AsyncIterable<ResumableStreamRecord<TEvent>>
  status(input: ResumableStreamStatusInput): Promise<ResumableStreamState>
  close(input: ResumableStreamCloseInput): Promise<ResumableStreamState>
}
```

Implement this interface over shared storage when resumable streams must survive process restarts or work across replicas.

## Envelope and store types

```ts
type EventStreamErrorEvent = {
  type: 'error'
  error: unknown
}

type ResumableStreamStatus =
  | 'running'
  | 'completed'
  | 'error'
  | 'missing'

type ResumableStreamFinalStatus = 'completed' | 'error'

type ResumableStreamState = {
  status: ResumableStreamStatus
  lastEventId: number
}

type ResumableStreamRecord<TEvent> = {
  streamId: string
  eventId: number
  event: TEvent | EventStreamErrorEvent
  createdAt?: Date
}
```

`ResumableStreamEnvelope<TEvent>` is a discriminated union:

- `stream_start` contains `streamId` and `eventId: 0`.
- `stream_event` contains the persisted event and its numeric event ID.
- `stream_end` contains the last event ID and current stream status.

The remaining public operation inputs are `ResumableStreamOpenInput`, `ResumableStreamAppendInput`, `ResumableStreamSubscribeInput`, `ResumableStreamStatusInput`, and `ResumableStreamCloseInput`. They map one-to-one to the store methods above.

## Export catalog

| Kind | Symbols |
| --- | --- |
| Functions | `createEventStream`, `createUIStreamResponse`, `createJsonlStream`, `createSseStream`, `createResumableStream`, `resumeStreamEvents`, `createMemoryResumableStreamStore` |
| Response options | `CreateEventStreamOptions`, `CreateEventStreamResumeOptions`, `EventStreamFormat`, `JsonlStreamOptions`, `SseStreamOptions` |
| Resumable contracts | `CreateResumableStreamOptions`, `ResumeStreamEventsOptions`, `ResumableStreamStore` |
| Resumable data | `ResumableStreamEnvelope`, `ResumableStreamRecord`, `ResumableStreamState`, `ResumableStreamStatus`, `ResumableStreamFinalStatus` |
| Store inputs | `ResumableStreamOpenInput`, `ResumableStreamAppendInput`, `ResumableStreamSubscribeInput`, `ResumableStreamStatusInput`, `ResumableStreamCloseInput` |
| Error event | `EventStreamErrorEvent` |

Return to the [`@anvia/server` overview](/packages/server).
