# Runtime lifecycle

A prompt run begins when `send()`, `stream()`, or `readableStream()` starts consuming a `PromptRequest`. The same request cannot execute concurrently or be reused after completion.

## Run sequence

The exact event set depends on the model and tools, but the runtime follows this ownership order:

1. Start the run and its observers/hooks.
2. Load session memory and apply input guardrails.
3. Retrieve dynamic context and dynamic tools when configured.
4. Call the completion model.
5. Validate and execute requested tools, including approvals and middleware.
6. Continue model turns until a final response, cancellation, or limit.
7. Apply final-output guardrails.
8. Persist configured memory/events and finish observers/hooks.

Tool failures are normally converted into model-visible tool results so the model can respond or recover. Runtime failures such as a turn-limit breach still reject `send()` and produce terminal error events when streaming.

## Retries

Completion retries are opt-in with `withCompletionRetries`. A streaming attempt can be retried only before the runtime has observed provider output. Once a provider event or delta has been observed, retrying could duplicate visible output, so the failure is surfaced instead. Usage from completed or authoritatively reported failed attempts remains included once.

## Cancellation and steering

Cancel a byte stream where it is consumed:

```ts
const stream = agent.prompt('Investigate the incident').readableStream()

// A UI stop action can call:
await stream.cancel('User stopped the run')
```

For async iterables, close the iterator from the consumer or let the transport propagate cancellation. `steer(...)` can enqueue new messages only while the request is active; accepted messages are consumed at safe model-turn boundaries in FIFO order.

## Shutdown

Core has no global process lifecycle. Provider clients, observers, MCP connections, database pools, and queues are application-owned. Flush or close them at the service or worker shutdown boundary defined by their packages.

See [streaming errors and cancellation](/sdk/streaming/errors-and-cancellation) and [hooks and run control](/sdk/advanced/hooks).
