# State and streaming

```text
UIMessage[]
   ↓ uiMessagesToMessages
ClientStreamRequest
   ↓ ClientTransport
ClientStreamFrame / ClientStreamEvent
   ↓ applyClientStreamEvent
UIMessage[] + status + usage + interactions
```

`events` retains protocol events for the current request. `messages` is reduced UI state; `text` and `completion` are derived convenience values.

Starting a new request aborts the previous transport. `stop()` aborts the active controller, and unmount does the same. HTTP cancellation may not undo provider or tool work already in progress, so server operations still need cancellation and idempotency rules.

## Resume

```ts
const chat = useChat({
  transport,
  resume: {
    key: 'support-chat',
    storage: 'sessionStorage',
    auto: true,
  },
})
```

The hook stores v3 state containing `streamId`, the latest event ID, messages, interactions, and the last typed request. A matching `resumeClientStreamResponse()` route replays later records. Terminal streams clear resume state.

## Interaction phases

When an agent suspends, the hook enters `waiting` and adds the request to `chat.interactions.pending`. Calling `respondToInteraction()` sends a discriminated `interaction_response` request. The application server resolves that ID to its trusted continuation and begins a linked stream phase; the continuation itself never belongs in browser state.

Smoothing hooks only buffer displayed values. They do not change source messages, events, or persistence.
