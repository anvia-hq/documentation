# `@anvia/server`

`@anvia/server` turns asynchronous Anvia events into HTTP streaming responses. It supports JSON Lines and Server-Sent Events, adds the correct transport headers, and can persist stream envelopes so a client can resume after navigation or a connection loss.

Use it at an HTTP route boundary. The agent or completion request produces events; this package only transports them.

## Install

```sh
pnpm add @anvia/server @anvia/core
```

## Return an agent stream

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

JSONL is the default format. Set `format: 'sse'` when the client or hosting platform expects `text/event-stream`.

## Key features

- `createEventStream` wraps any `AsyncIterable` in a streaming `Response`.
- `createUIStreamResponse` narrows the event type to Core's `UIStreamEvent` contract.
- `createJsonlStream` and `createSseStream` expose lower-level byte streams.
- `createResumableStream` assigns monotonically increasing event IDs and persists envelopes.
- `resumeStreamEvents` replays stored events and tails a run that is still active.
- `ResumableStreamStore` lets applications supply durable, shared persistence.

## Common patterns

### Keep generation outside the transport call

Create the prompt request first, then pass its stream to `createEventStream`. This makes cancellation, tracing, and testing easier to understand than hiding agent construction inside the response helper.

### Forward request cancellation

The prompt request owns model execution. Use its cancellation API or the underlying provider signal as described in [Errors and cancellation](/sdk/streaming/errors-and-cancellation). The server helper consumes events; it does not decide when the agent should stop.

### Use durable storage for resumable production streams

`createMemoryResumableStreamStore` is useful for local development and tests. It is process-local and disappears on restart, so production deployments with multiple workers should implement `ResumableStreamStore` against shared durable storage. See [Resumable streams](/sdk/streaming/resumable-streams).

### Preserve the wire format on both sides

Pair JSONL responses with `readJsonlStream` or the default `@anvia/react` transport. Pair SSE responses with `readSseStream` or `format: 'sse'` on the client.

## Runtime compatibility

| Field | Value |
| --- | --- |
| Package format | ESM |
| Required web APIs | `Response`, `ReadableStream`, `TextEncoder`, `Headers` |
| Anvia dependency | `@anvia/core` |
| Framework coupling | None |

The package works in server runtimes that implement the standard Fetch and Web Streams APIs. Whether a hosting platform flushes streaming responses promptly is platform-specific; verify buffering and execution limits before production use.

## Continue learning

- [Server transport](/sdk/streaming/server-transport)
- [Completion streams](/sdk/streaming/completion-streams)
- [Agent streams](/sdk/streaming/agent-streams)
- [Resumable streams](/sdk/streaming/resumable-streams)
- [Run an agent in Studio](/studio/playground/run-an-agent)

For exact exports and signatures, use the [API reference](/packages/server/api-reference). For release history, read the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/server/CHANGELOG.md).
