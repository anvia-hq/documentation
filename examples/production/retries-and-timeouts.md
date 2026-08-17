# Retries and timeouts

**Level:** Pattern

## Outcome

Retry transient completion failures with bounded exponential backoff while keeping deadlines and
side-effect retries under explicit application control.

## When to use it

Use completion retries for temporary provider failures. Do not automatically retry invalid input,
authorization failures, content-policy rejections, or ambiguous side effects.

## Setup

Install the Anvia runtime, provider adapter, and `zod` when tools validate inputs. Configure network
timeouts in the provider or HTTP client chosen by the application.

## Retry boundary

```ts
const response = await agent.generate({
    prompt: message,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 2000,
        shouldRetry: ({ error, streaming }) => !streaming && isTransientProviderFailure(error),
    }
});
```

`maxAttempts` includes the initial attempt. Anvia adds randomized exponential delay up to the cap.
Its default classifier retries common connection/time-out errors, `408`, `409`, `425`, `429`, and
`5xx`; it does not retry `AbortError`. Streaming completion calls are retried only before provider
progress is emitted.

## Time budgets

Configure connection and request timeouts in the provider client or deployment network when that
adapter exposes them. For tools, pass an application `AbortSignal` into the client used by the tool:

```ts
const lookup = createTool({
  name: "lookup_order",
  description: "Read an order from the commerce service.",
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: Order,
  async execute({ orderId }) {
    return commerce.getOrder(orderId, {
      signal: AbortSignal.timeout(5_000),
    });
  },
});
```

Anvia does not turn an arbitrary `Promise.race()` timeout into cancellation of provider work. A
deadline that only stops waiting can leave the underlying call running, so use a client that
actually accepts an abort signal.

For a custom browser UI, abort the active HTTP request:

```ts
const controller = new AbortController();

const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify(payload),
  signal: controller.signal,
});

controller.abort();
```

This is a consumer cancellation boundary. A normal `createClientStreamResponse()` response closes the
active agent iterator when its reader disconnects; whether provider network work has already
completed still depends on the adapter and transport.

## Run and expected behavior

Run against a fake completion model that rejects twice with a retryable error and succeeds once. The
third attempt returns the response. Change the error to `AbortError` and confirm the first rejection
is returned without another attempt.

## Failure scenarios and production ownership

Retries increase tail latency and can amplify an outage. Cap attempts and total elapsed time, honor
provider guidance, and add rate-aware admission before retries. External writes need provider-backed
idempotency keys. Never retry an entire tool-using run blindly after a side effect may have completed.

## Tests

Use fake time and a fake `CompletionModel` that fails a known number of times. Assert attempt count,
non-retryable errors, streaming-after-progress behavior, tool abort handling, and no duplicated
effects. Include one integration test against a mock HTTP server that hangs and then closes.

## Source and extensions

- Source: [`retry.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/core/src/retry.ts)
- Read [stream errors and cancellation](/sdk/streaming/errors-and-cancellation) and [failure recovery](/examples/data-and-workflows/failure-recovery).
- Add circuit breaking, provider fallback, and an operation-wide deadline budget.
