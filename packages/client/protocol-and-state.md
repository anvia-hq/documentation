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
