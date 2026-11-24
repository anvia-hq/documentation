# Capabilities

`@anvia/server` exposes two related transport layers:

- Client protocol: `createClientStreamResponse` and `resumeClientStreamResponse` validate and frame `@anvia/client` events.
- Generic events: `createEventStreamResponse` and `resumeEventStreamResponse` transport application-defined values.
- Encoders: `createJsonlStream` and `createSseStream` return byte streams.
- Resume: `createResumableStream`, `resumeStreamEvents`, `createMemoryResumableStreamStore`, and `ResumableStreamStore` provide generic persistence contracts.
- Validation: `parseResumableAfter`, `InvalidResumableAfterError`, and `resumeAfterErrorResponse` enforce a nonnegative safe integer cursor and format the 400 response.
- Durable HTTP: `createDurableHandler` from `@anvia/server/durable` maps payload limits to 413 and capacity to 429 with `{ error, code, field? }`.

Response helpers set no-cache, keep-alive, proxy-buffering, and format-appropriate content-type headers unless the application overrides them.

The in-memory resumable store retains closed streams for a configurable TTL and count, evicting oldest first and never evicting running streams. It is a single-process development and test store, not shared durable storage.

Client-protocol responses validate `message_reset` as of Client 1.6.0. Keep the server's Client dependency and browser clients on compatible versions.

The package does not own model execution, authentication, authorization, CORS, CSRF protection, compression, durable production storage, or background-job lifecycle.
