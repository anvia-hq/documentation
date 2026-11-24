# Durable chat transport

`@anvia/client/durable-chat` adapts a `@anvia/durable` endpoint to the `ClientTransport` contract used by `useChat` from `@anvia/react` and the `@anvia/react-ui` chat primitives. Create one transport per chat session: the agent and session identity live in the transport because an individual chat request carries only messages.

```sh
pnpm add @anvia/client @anvia/durable @anvia/react
```

```ts
import { DurableClient } from '@anvia/client/durable'
import { createDurableChatTransport } from '@anvia/client/durable-chat'
import { useChat } from '@anvia/react'

const client = new DurableClient({
  endpoint: 'https://your-app.example/durable',
  headers: () => ({ Authorization: `Bearer ${getAccessToken()}` }),
})

const transport = createDurableChatTransport({
  client,
  agentId: 'researcher',
  sessionId: 'chat-42',
})

const chat = useChat({ transport })
```

`getAccessToken()` is application-owned. Keep the durable runtime and handler on the server; the browser only receives the HTTP client and this transport.

## Options

| Option | Purpose |
| --- | --- |
| `client` | A `DurableChatClient`: the `submit`, `stream`, `respond`, `resolveTool`, `retry`, `cancel`, and `listRuns` methods of `DurableClient`. |
| `agentId` | Registered agent used for every submission from this transport. |
| `sessionId` | Durable session that owns the transcript and serializes unfinished work. |
| `requestId` | Optional function returning a submission ID. Defaults to a new UUID per submission; return a stable value to deduplicate one prompt. |
| `enqueue` | Queue behind unfinished session work instead of failing. Defaults to `true`. |

## Submit and enqueue behavior

A `messages` request submits only its last user message:

```ts
await client.submit(
  {
    agentId: 'researcher',
    sessionId: 'chat-42',
    requestId: 'application-generated-id',
    prompt: lastUserMessage,
  },
  { enqueue: true },
)
```

The rest of the hook's message array is not sent; durable's session history is authoritative. If the request contains no user message, `send()` throws a `TypeError` before submitting.

With the default `enqueue: true`, a prompt submitted while the session still has unfinished work is persisted behind that work. With `enqueue: false`, the server rejects the submission with HTTP 409 and the adapter throws [`DurableBusyError`](#busy-sessions-and-durablebusyerror). Reusing a request ID returns the original run; sending different content under the same `(sessionId, requestId)` pair is rejected.

The send `abortSignal` is forwarded to the submission and to the event stream. A mutation that was already accepted is not undone by aborting.

## Event mapping

The adapter maps committed durable journal events to `anvia.client.v3` frames:

| Durable event or status | Client frames |
| --- | --- |
| `submitted`, or the first `queued` / `pending` / `running` status in a replay | `run_start` |
| `model_started` | `turn_start`, `generation_start`, `message_start` |
| `model_delta` (`text_delta`) | `text_start` then `text_delta` |
| `model_delta` (`reasoning_delta`) | `reasoning_start` then `reasoning_delta` |
| `model_delta` (`tool_call_delta`, `tool_call`) | `tool_call_start`, `tool_call_delta`, or `tool_call_end` |
| `model_delta` (`source`, `provider_tool_call`) | `source` or `provider_tool_call` |
| `model_completed` | Content end events then `message_end` with usage and context usage |
| `model_attempt_started` after a retry | `message_reset` for the same message ID, then the new attempt's deltas |
| `model_attempt_failed` | Transient `data` event `durable_model_attempt_failed`; not a top-level error |
| `tool_started` | `tool_call_end` with the finalized input |
| `tool_completed` | `tool_result` |
| `compaction_completed` | `memory_compaction` |
| `steering_queued` / `steering_applied` | Transient `data` events named after the durable event |
| `waiting` or an interaction outcome | `interaction`, then `run_end` with status `suspended` |
| `completed` | `run_end` with status `completed` |
| `failed` | `error` (`DurableRunError`, code `failed`) then `run_end` with status `error` |
| `needs_attention` | `error` (`DurableNeedsAttention`, code `needs_attention`, retryable) then `run_end` with status `error` |
| `cancelled` | `run_end` with status `cancelled` |
| `blocked` outcome | `run_end` with status `blocked` |

A retried model attempt keeps the assistant message identity and emits `message_reset` before new content, so the reducer discards the partial attempt instead of leaving an empty message. See [protocol and state](/packages/client/protocol-and-state#retries-and-message-reset).

Frame `eventId` values are durable event sequences, which are global to the store and therefore not contiguous within one chat stream. Consume the frames through `useChat` or keep them opaque; do not wrap this transport in the contiguous frame validator used by `createHttpClientTransport()`.

## Interactions

An approval or structured question arrives as an `interaction` event followed by `run_end` with status `suspended`. `useChat().respondToInteraction()` sends an `interaction_response` request; the transport delivers it to the run that produced it with `client.respond(runId, interactionId, response)` and then resumes the event stream after the last applied sequence. It does not submit a new prompt.

If no run is active when an interaction response arrives, `send()` throws instead of guessing a run. Call `reattach(runId)` first, for example after restoring a saved run ID.

## Resume and reattach

`useChat` persists a `{ streamId, after }` cursor: `streamId` is the durable run ID and `after` is the last durable sequence applied. A send with `resume` (or `request.resume`) streams that run after the cursor without submitting or responding again.

```ts
const controller = transport.controller
controller.reattach(runId, after) // point later sends at an existing run
```

`reattach()` only changes local routing. It does not open a stream; the next `send()` does. The cursor must be a nonnegative safe integer, and the run ID must be nonblank; invalid values throw a `TypeError`.

A saved cursor is only useful while the run and its events remain available. Durable stores events for the life of the journal; the transport itself keeps no extra buffer.

## Controller

`transport.controller` exposes controls that `useChat` does not:

| Member | Signature | Behavior |
| --- | --- | --- |
| `activeRunId` | `string \| undefined` | Run last submitted or reattached. `undefined` before the first successful send. |
| `reattach` | `(runId: string, after?: number) => void` | Route later interaction responses and resumes to an existing run. `after` defaults to `0`. |
| `cancel` | `(runId?: string) => Promise<void>` | Cancel the given run, or the active run. |
| `retry` | `(runId?: string) => Promise<void>` | Retry a failed or blocked run. Rejected while a later submission has advanced the session. |
| `resolveTool` | `(operationId: string, output: ToolResultOutput, runId?: string) => Promise<void>` | Supply a reconciled result for a blocked manual tool. `operationId` is the snapshot's `blockedOperation`. |

`cancel()`, `retry()`, and `resolveTool()` throw when neither an explicit run ID nor an active run is available.

## Stop, abort, and cancellation

`useChat().stop()` aborts the current subscription. The adapter then stops yielding frames and throws the abort error; it never sends a cancel request. The durable run keeps executing, and reattaching later resumes its journal.

Cancellation is explicit:

```ts
await transport.controller.cancel()
```

Aborting a submission or stream is not a durable cancellation, and a transport error does not cancel the run.

## Busy sessions and `DurableBusyError`

When a session already has unfinished work and the submission is not queued, the server returns HTTP 409. The adapter throws `DurableBusyError`:

```ts
import { DurableBusyError } from '@anvia/client/durable-chat'

try {
  await chat.sendMessage({ text: 'Continue the analysis.' })
} catch (error) {
  if (error instanceof DurableBusyError) {
    if (error.runId !== undefined) transport.controller.reattach(error.runId)
  } else {
    throw error
  }
}
```

`DurableBusyError` has `code: 'session_busy'` and a best-effort `runId`. The adapter finds it by listing the session's runs; `runId` is `undefined` when that lookup fails or does not find the unfinished run in the returned page. Reattach to the run instead of submitting the same prompt again.

## Known limitations

- Client history is discarded. The hook's earlier messages are not used to rebuild a prompt, so a reset or a reconnected hook can diverge from the stored session.
- `regenerate()` sends the last user message again as a new durable submission. `reset()` clears only the local hook state. Neither rewrites durable history.
- Thread lists are not part of this adapter. Durable sessions and runs are server data; use `DurableClient.listRuns({ sessionId })` with your own authorization.
- The transport does not authenticate, persist cursors, retry HTTP mutations, or cancel runs on unmount. Your application owns those decisions.
- One transport targets one `agentId` and `sessionId`. Use separate transports for separate chats.

## Server-side authorization

The adapter assumes a `createDurableHandler()` route in front of the runtime. Authorization remains application-owned:

- Authenticate every request and authorize each `DurableAuthorization` action, including reads and event subscriptions.
- On submission, verify that the caller may use `agentId` and may act in `sessionId`. A session ID organizes history and deduplication; it does not prove ownership.
- For existing runs, authorize against the session stored in the database, not a client-supplied value.
- Allowlist the agents and task definitions each caller may submit, and keep the runtime, SQLite file, and provider credentials server-side.
- Enforce a request body policy. `maxBodyBytes` is the binding ceiling for uploads and defaults to 64 KiB.

See [HTTP server and client](/packages/durable/http#server-handler) for routes, authorization resources, and the payload and capacity error responses.