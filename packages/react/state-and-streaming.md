# State and streaming

The hooks keep presentation state separate from the server transcript boundary.

## Message flow

`useChat` appends a local user `UIMessage`, converts all UI messages to Core messages, builds the request, and consumes transport events. Standard events update text, reasoning, tool, attachment, error, metadata, and context-usage parts without replacing the whole transcript.

```text
UIMessage[]
   ↓ uiMessagesToCoreMessages
UIStreamRequest
   ↓ EventTransport
stream events
   ↓ reducer
UIMessage[] + status + usage + human input
```

`events` retains the raw generic events for the current request. `messages` is the reduced UI state. `text` and `completion` are derived convenience values, not separate server records.

## Overlapping requests and stopping

Starting a new chat or completion request aborts the previous transport request. `stop()` aborts the active controller. The hooks also abort during unmount. A custom transport must observe `TransportOptions.signal` for this to stop underlying work.

HTTP cancellation alone may not stop a server-side model or background run. The server route and event source must propagate iterator cancellation or use an explicit run-control endpoint.

## Custom events

Use `eventToUIEvent` for a custom event that can map to the shared UI protocol. Use `eventToDelta` and `eventToFinal` for simpler text protocols. When any custom mapper is supplied, define its behavior deliberately rather than assuming the built-in Core event reducer will also run.

## Resume

```ts
const chat = useChat({
  endpoint: '/api/chat',
  resume: {
    key: 'support-chat',
    storage: 'sessionStorage',
    auto: true,
  },
})
```

The hook stores versioned state with `streamId`, last event ID, and messages. On resume it sends `{ streamId, after }` and reduces replayed/tailing envelopes. Terminal streams clear resume state. This requires a matching [`@anvia/server` resumable route](/packages/server/streaming).

## Display smoothing

Smoothing hooks buffer only the displayed value. They do not modify `messages`, raw events, or persistence. Keep the hook mounted when `isStreaming` becomes false so its buffered tail can drain; change `resetKey` when switching source content, and use `flushImmediately` for terminal errors.

See the [API reference](/packages/react/api-reference) for result and adapter types.
