# State and streaming

```text
UIMessage[]
   ↓ uiMessagesToMessages
ClientStreamRequest
   ↓ ClientTransport
ClientStreamFrame / ClientStreamEvent
   ↓ applyClientStreamEvent
UIMessage[] + status + usage + human input
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

The hook stores v2 state containing `streamId`, the latest event ID, and messages. A matching `resumeClientStreamResponse()` route replays later records. Terminal streams clear resume state.

Smoothing hooks only buffer displayed values. They do not change source messages, events, or persistence.
