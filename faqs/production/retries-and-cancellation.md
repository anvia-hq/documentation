# How do retries and cancellation work?

Cancellation is cooperative, and retries belong at the boundary that understands whether an operation is safe to repeat.

## Cancellation

For a normal browser stream on a host that propagates disconnects through Fetch and Web Streams, the usual path is:

```text
user presses Stop → client aborts fetch → response body is cancelled
                  → server transport asks the event iterator to return
```

Closing the async iterator returned by `agent.stream(...)` stops further consumption. Cancelling an HTTP response normally propagates that closure through `@anvia/server`, but it cannot guarantee that a provider call or tool already in progress is interrupted. If a custom provider, tool, or worker operation supports an abort signal, the application must wire and enforce that cancellation at its own boundary.

A resumable server stream is intentionally different: it keeps consuming and storing events after the client disconnects so the client can reconnect later.

A direct `ReadableStream.cancel()` is appropriate only when application code owns that local stream. None of these mechanisms undo a completed external side effect.

## Retries

Retry transient reads and idempotent requests with bounded attempts, backoff, jitter, and observability. Do not automatically retry a tool that might charge a card, send a message, or mutate a record unless it has an idempotency contract.

Configure completion retries per run:

```ts
const result = await agent.generate({
    prompt: input,
    retries: { maxAttempts: 3 }
})
```

This retries only a failed model invocation in the current turn. For streaming, Anvia retries only before the provider has emitted output, which avoids duplicating content already observed by the caller.

Treat these as separate decisions:

- provider request retry;
- tool retry;
- pipeline step retry;
- entire job retry;
- client reconnection or stream resume.

See [stream errors and cancellation](/sdk/streaming/errors-and-cancellation), [cancellation boundaries](/sdk/advanced/hooks/cancellation), and [retry guidance](/sdk/advanced/parallel-and-batch/retries).
