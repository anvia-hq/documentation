# How do retries and cancellation work?

Cancellation is cooperative, and retries belong at the boundary that understands whether an operation is safe to repeat.

## Cancellation

For a normal browser stream on a host that propagates disconnects through Fetch and Web Streams, the usual path is:

```text
user presses Stop → client aborts fetch → response body is cancelled
                  → server transport asks the event iterator to return
```

Closing the async iterator returned by `agent.stream(...)` stops further consumption. Cancelling an HTTP response normally propagates that closure through `@anvia/server`.

To cancel the run itself, pass an `abortSignal` to `agent.generate(...)`, `agent.stream(...)`, or `generateCompletion(...)`. Anvia forwards it to model calls, and a tool handler receives it as `context.abortSignal`:

```ts
const controller = new AbortController()

const result = await agent.generate({
    prompt: input,
    abortSignal: controller.signal
})
```

A signal interrupts work only where the provider client, tool, or service honors it. Pass `context.abortSignal` to your own in-flight requests, and enforce cancellation in custom providers and workers.

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

For agent runs that must continue after a process restart, [durable execution](/faqs/production/durable-execution) persists model retry waits and replays committed results instead of repeating them.

See [per-run controls](/sdk/agents/per-run-controls), [tool execution](/sdk/tools/validation-and-execution), [stream errors and cancellation](/sdk/streaming/errors-and-cancellation), [cancellation boundaries](/sdk/advanced/hooks/cancellation), and [retry guidance](/sdk/advanced/parallel-and-batch/retries).
