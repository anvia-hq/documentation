# Capabilities

`@anvia/react` owns client state and streamed transport behavior, not rendering or server execution.

| Surface | APIs | Responsibility |
| --- | --- | --- |
| Chat | `useChat` | Messages, events, send/regenerate/stop/reset, suggestions, usage, resume, human input |
| Completion | `useCompletion` | Input, appended turns, completion text, events, usage, stop/reset |
| Fetch transport | `createFetchTransport`, `createChatTransport` | Endpoint, method, body, headers, JSONL/SSE, custom fetch, event mapping |
| Direct transport | `createDirectTransport` | In-process async-iterable handler for tests or custom runtimes |
| Stream readers | `fetchEventStream`, `readJsonlStream`, `readSseStream` | Fetch and parse encoded event streams |
| Smoothing | `useSmoothStreamText`, `useSmoothStreamItems` | Display-only buffered reveal state |
| Human input | Approval/question adapters and mutations | Track pending decisions and call application endpoints |
| Resume | `useChat({ resume })` | Store resume cursor and messages, request replay from Server |
| Memory hydration | `initialMessagesFromMemory` | Convert persisted Core messages into initial UI state |

## Default wire contract

The hooks default to `UIStreamRequest`, containing Core messages, `stream: true`, and an optional resume cursor. They can consume standard UI events, raw Core completion events, or raw agent stream events. Custom event formats require explicit mapping.

## Boundaries

The package does not render Markdown, sanitize links, authenticate approval actions, persist conversations to a server, or create resumable storage. Browser resume state is only a cursor and transcript cache; the server must implement resumable envelopes and durable storage where required.

React `>=18` is the declared peer dependency. Default fetch transports need Fetch and Web Streams; resume needs browser storage unless the application supplies a custom `Storage` object.

See [state and streaming](/packages/react/state-and-streaming) and the [API reference](/packages/react/api-reference).
