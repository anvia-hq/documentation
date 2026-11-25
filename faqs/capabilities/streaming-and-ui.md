# What do I need for streaming and UI?

You need a server-side model or agent stream, an HTTP transport when the client is remote, and optional client state or UI packages. Streaming support still depends on the selected provider and model.

| Layer | Use |
| --- | --- |
| One model call | [Completion stream](/sdk/streaming/completion-streams) |
| Full agent run, including tools and runtime events | [Agent stream](/sdk/streaming/agent-streams) |
| Browser-safe protocol, event mapping, and HTTP transport | [`@anvia/client`](/packages/client) |
| JSONL or SSE HTTP response | [`@anvia/server`](/packages/server) |
| Headless React state and transport | [`@anvia/react`](/packages/react) |
| Composable chat components | [`@anvia/react` primitives](/packages/react/capabilities) |

## Which HTTP format should I use?

JSONL is the default for the Anvia client protocol. Use SSE when the deployment or an existing client requires `text/event-stream`, and set `format: 'sse'` on both `createClientStreamResponse()` and `createHttpClientTransport()`. Both serialize events; neither decides which runtime details are safe for a browser.

Project raw events before sending them to users. Tool arguments, results, reasoning, provider metadata, and errors may contain sensitive data. Keep credentials and execution on the server. See [Server transport](/sdk/streaming/server-transport).

## Does adding a Stop button cancel completed work?

No. Client cancellation stops stream consumption and propagates through the response path, but it does not undo completed tool calls or application writes. Long-running work needs its own cancellation and cleanup semantics. Read [Errors and cancellation](/sdk/streaming/errors-and-cancellation).

## What about durable runs?

For runs executed by `@anvia/durable`, use `useDurableChat` from `@anvia/react` with the durable chat transport. It maps the durable journal to the same protocol frames and resumes from a run ID and sequence. There, `chat.stop()` only detaches the subscription; cancel the run with `transport.controller.cancel()`. See [Durable chat transport](/packages/client/durable-chat).

## Can a client resume any stream?

No. Client resume state must be paired with the server's resumable stream wrapper and persistence. A normal disconnected stream is not replayable just because the UI kept a cursor. See [Resumable streams](/sdk/streaming/resumable-streams).

The UI packages are optional. Any client that understands your projected event protocol can consume the stream. See [Agent API](/features/agent-api) for the end-to-end route and UI shape.
