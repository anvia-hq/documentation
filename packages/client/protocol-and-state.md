# Protocol and state

The public stream protocol is always framed as `anvia.client.v3`. `createHttpClientTransport()` validates the response protocol header, frame sequence, stream identity, and monotonically increasing event IDs before yielding application events.

## Request union

```ts
type ClientStreamRequest =
  | {
      type: 'messages'
      messages: readonly Message[]
      metadata?: JsonObject
      resume?: ClientStreamCursor
    }
  | {
      type: 'interaction_response'
      interactionId: string
      response: AgentInteractionResponse
      metadata?: JsonObject
      resume?: ClientStreamCursor
    }
```

`UIMessage[]` is client state; it does not cross the server boundary. Convert deliberately with `uiMessagesToMessages()` and `messagesToUIMessages()`.

## Interactions

`ClientInteraction` records the public interaction request, originating run ID, and `pending`, `responded`, or `cancelled` status. A response addresses the interaction by ID. The server owns the continuation, verifies the caller, claims it once, and rejects unknown, expired, already-used, or mismatched responses.

## State reduction

`applyClientStreamEvent(messages, event)` applies canonical events to `UIMessage[]`. Runtime status, usage, context usage, and trace correlation live in `UIMessage.generation`; app-owned metadata round-trips separately.

Errors are masked by default. Use `mapError` only at the trusted adapter boundary when the application intentionally exposes a safe public shape.

## Retries and message reset

Protocol 1.6.0 adds the validated `message_reset` event:

```ts
{ type: 'message_reset', messageId: string }
```

A server emits it before retry content when a repeated `generation_start` targets an unfinished turn. `applyClientStreamEvent()` clears that message's parts, metadata, and generation state while preserving its ID and role. Completed turns and other agent scopes are unaffected. Custom reducers must handle the event; an older client validator rejects it, so upgrade the server and frontend copies of `@anvia/client` together.

## Public error boundaries

`ClientProtocolError` from `@anvia/client` identifies invalid request/event/frame/message shapes and
framed transport contract violations. Its optional `value` may retain the offending payload.
A generic HTTP failure instead throws `EventStreamHttpError` from `@anvia/client/transport` with
the HTTP response and raw text body.

Malformed JSON frames are a separate boundary. `readJsonlStream`, `readSseStream`, and
`readSseFrames` skip them by default and report an `EventStreamParseError` through `onParseError`;
`strict: true` throws instead. `createFetchEventTransport` and `createHttpClientTransport` accept
`onParseError`, while `DurableClient` streams always parse strictly. A malformed frame that is
skipped is not a `ClientProtocolError`, and the framed protocol validator never receives it.
Application event validation can still throw before any valid protocol event is available.

`maskedClientError()` returns `{ message: 'An unexpected error occurred.' }` for a public stream.
`normalizeClientError(value)` returns an Error: existing Errors are returned unchanged; valid
`ClientStreamError` objects preserve their message and optional name; strings become the message;
other values get a generic message. Normalization is not redaction. Never send `value`, HTTP
`body`, stack traces, or arbitrary exception messages to a browser without an explicit safe mapping.

```ts anvia-check client-errors-example
import { maskedClientError, normalizeClientError, ClientProtocolError, parseClientStreamRequest } from '@anvia/client'

const publicError = maskedClientError()
const localError = normalizeClientError({ message: 'Safe application message', name: 'ApplicationError' })
try {
  parseClientStreamRequest({ type: 'unknown' })
} catch (error) {
  if (!(error instanceof ClientProtocolError)) throw error
  console.log(publicError.message, localError.name)
}
```

For custom event protocols, validate every parsed value with `mapEvent`; see
[generic transports](/packages/client/api-reference#generic-event-transport-reference).

For durable runs, the [durable chat transport](/packages/client/durable-chat) produces these
frames from the durable journal and uses a run ID plus sequence as its resume cursor.
