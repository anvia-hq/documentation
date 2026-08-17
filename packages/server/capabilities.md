# Capabilities

`@anvia/server` exposes two related transport layers:

- Client protocol: `createClientStreamResponse` and `resumeClientStreamResponse` validate and frame `@anvia/client` events.
- Generic events: `createEventStreamResponse` and `resumeEventStreamResponse` transport application-defined values.
- Encoders: `createJsonlStream` and `createSseStream` return byte streams.
- Resume: `createResumableStream`, `resumeStreamEvents`, `createMemoryResumableStreamStore`, and `ResumableStreamStore` provide generic persistence contracts.

Response helpers set no-cache, keep-alive, proxy-buffering, and format-appropriate content-type headers unless the application overrides them.

The package does not own model execution, authentication, authorization, CORS, CSRF protection, compression, durable production storage, or background-job lifecycle.
