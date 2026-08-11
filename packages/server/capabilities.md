# Capabilities

`@anvia/server` has one public entry point and a deliberately small responsibility: encode an asynchronous event source and expose it through Fetch-compatible streaming primitives.

| Capability | API | Behavior |
| --- | --- | --- |
| Streaming response | `createEventStream` | Wraps any `AsyncIterable<T>` in a JSONL or SSE `Response` |
| UI response | `createUIStreamResponse` | Same transport behavior, typed for `UIStreamEvent` |
| JSONL encoder | `createJsonlStream` | Emits one serialized event plus newline per chunk |
| SSE encoder | `createSseStream` | Emits JSON data fields with optional event names and retry value |
| Resumable producer | `createResumableStream` | Persists numbered event records and yields resume envelopes |
| Resume consumer | `resumeStreamEvents` | Replays after a cursor and tails a running stream |
| Development store | `createMemoryResumableStreamStore` | Process-local resumable state for tests and local use |
| Store contract | `ResumableStreamStore` | Application-defined durable/shared persistence boundary |

## What the package adds

Response helpers set transport defaults unless the application already supplied them:

- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`
- JSONL or SSE `Content-Type`

Encoder failures become a final `{ type: 'error', error }` event. Native `Error` values retain name and message but not their stack.

## What it does not add

Server does not own model execution, cancellation policy, authorization, CORS, CSRF protection, compression, durable storage, reconnecting clients, or background-job lifecycle. A deployment can still buffer or terminate streams despite the response headers.

See the [API reference](/packages/server/api-reference) for all option and envelope types.
