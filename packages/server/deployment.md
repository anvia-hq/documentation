# Deployment

Deploy `@anvia/server` only where Fetch-compatible `Response`, `ReadableStream`, `Headers`, and `TextEncoder` are available and the platform permits streaming responses.

## Route boundary

Authenticate and authorize before starting model work. Validate the requested session, user, and tenant, apply request-size and rate limits, then construct the prompt request. Once a streaming status is sent, HTTP status can no longer represent later model or tool failures; those arrive as stream events.

## Proxy behavior

The package sets no-cache/no-transform, keep-alive, and `X-Accel-Buffering: no` defaults. Proxies, serverless platforms, and framework adapters may still buffer chunks, compress the response, enforce idle timeouts, or terminate execution after the client disconnects.

Verify in the real deployment that:

- the first event arrives before the run finishes;
- cancellation reaches the event producer;
- idle periods do not trigger a proxy timeout;
- response compression does not create unacceptable buffering;
- JSONL or SSE content types survive framework middleware.

## Resumable storage

`createMemoryResumableStreamStore` is not production persistence. It is lost on restart and differs between replicas. Use a shared store when a reconnect can land on another worker, and define retention and cleanup for completed stream records.

Resumability also does not make arbitrary serverless work durable. If the platform stops the process after disconnection, move long-running work to an application-owned worker and let the route stream from durable state.

## Observability

Record route authentication failures and transport failures separately from agent run traces. Flush observer/exporter buffers during graceful shutdown; Server itself has no global cleanup API.

See [production workers](/sdk/pipelines/production-workers) and [streaming errors](/sdk/streaming/errors-and-cancellation).
