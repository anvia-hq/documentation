# Runtime lifecycle

An agent run begins when `generate(...)` is called or an `agent.stream(...)` iterable starts being consumed. Each call creates an independent run.

## Run sequence

The exact event set depends on the model and tools, but the runtime follows this ownership order:

1. Start the run, lifecycle callbacks, and observers.
2. Load session memory and apply input guardrails.
3. Retrieve dynamic context and dynamic tools when configured.
4. Call the completion model.
5. Validate and execute requested tools, including approvals and middleware.
6. Continue model turns until a final response, cancellation, or limit.
7. Apply final-output guardrails.
8. Persist configured memory/events and finish lifecycle callbacks and observers.

Tool failures are normally converted into model-visible tool results so the model can respond or recover. Runtime failures such as a turn-limit breach reject `generate()` and produce terminal error events when streaming.

## Retries

Completion retries are opt-in through the run's `retries` option. A streaming attempt can be retried only before the runtime has observed provider output. Once a provider event or delta has been observed, retrying could duplicate visible output, so the failure is surfaced instead. Usage from completed or authoritatively reported failed attempts remains included once.

## Cancellation and steering

Cancel a browser request where it is consumed:

```ts
const controller = new AbortController()

fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Investigate the incident' }),
  signal: controller.signal,
})

controller.abort()
```

For async iterables, close the iterator from the consumer or let the transport propagate cancellation. Cancellation does not reverse completed tool side effects.

## Shutdown

Core has no global process lifecycle. Provider clients, observers, MCP connections, database pools, and queues are application-owned. Flush or close them at the service or worker shutdown boundary defined by their packages.

See [streaming errors and cancellation](/sdk/streaming/errors-and-cancellation) and [lifecycle and run control](/sdk/advanced/hooks).
