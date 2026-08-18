# Capabilities

`@anvia/react` owns React state, not transport implementation, rendering, or server execution.

- Chat: `useChat` manages UI messages, protocol events, send/regenerate/stop/reset, suggestions, context usage, stream resume, and interaction responses.
- Completion: `useCompletion` manages input, completion text, events, usage, submit/stop/reset.
- Smoothing: `useSmoothStreamText` and `useSmoothStreamItems` pace display without mutating stored state.
- Transport: supply a `ClientTransport` from `@anvia/client`, normally `createHttpClientTransport()`.
- Resume: the hook stores v3 cursor, message, interaction, and request state; `@anvia/server` and durable storage own replay.

The request union is `{ type: 'messages', messages, metadata?, resume? }` or `{ type: 'interaction_response', interactionId, response, metadata?, resume? }`. Hooks consume the versioned client frame/event protocol, not raw agent or completion events.

React `>=18` is the declared peer dependency. HTTP transport requires Fetch and Web Streams; resume requires browser storage or a supplied `Storage` implementation.
