# Execution

`decide()` takes the request, the model, and two optional controls.

```ts
const result = await decide({
  model,
  state: 'Please refund the duplicate charge.',
  questions: { refund: check({ instructions: 'Is a refund requested?' }) },
  retries: { maxAttempts: 3 },
  abortSignal: controller.signal,
  providerOptions: { /* provider-specific JSON */ },
})
```

| Option | Purpose |
| --- | --- |
| `model` | A `DecisionModel`, such as one created by [`JevClient.decisionModel()`](/sdk/providers/jev/decisions). |
| `state` | JSON-compatible data to judge. |
| `questions` | Named questions. |
| `retries` | `false`, or retry options. Disabled by default. |
| `abortSignal` | Cancels the call. |
| `providerOptions` | A JSON object forwarded to the provider. |

## 1. Retries

Retries are off unless you pass `retries`. `retries: false` disables them explicitly. Otherwise the object uses the shared Anvia retry policy:

| Field | Default | Meaning |
| --- | --- | --- |
| `maxAttempts` | `3` | Total attempts, including the first call. |
| `initialDelayMs` | `100` | Base of the exponential backoff, with jitter. |
| `maxDelayMs` | `1000` | Cap for the backoff delay. |
| `shouldRetry` | Transient-failure policy | Receives a `RetryContext` and returns whether to retry. |

```ts
await decide({
  model,
  state,
  questions,
  retries: {
    maxAttempts: 4,
    shouldRetry: ({ error, attempt }) => attempt < 2 || isTransient(error),
  },
})
```

The default policy retries transient failures such as timeouts, connection errors, and retryable HTTP statuses. A malformed provider answer is a validation failure, not a transient one; supply `shouldRetry` if you want to retry `DecisionProviderOutputError`. Each retry repeats the provider call, so it can repeat billed usage.

With Jev, the adapter disables the vendor SDK's own retries so `decide({ retries })` is the single owner of retry behavior.

## 2. Cancellation

```ts
const controller = new AbortController()
setTimeout(() => controller.abort(), 5_000)

try {
  await decide({ model, state, questions, abortSignal: controller.signal })
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    // Cancelled by the caller.
  }
}
```

An already aborted signal rejects before any work starts. Cancellation rejects with an `AbortError`, including when it happens while the provider is completing its response, and an aborted call is never retried.

## 3. Provider options

`providerOptions` carries provider-specific JSON settings. It must be a plain JSON object. Adapters must preserve the model, state, and question contract when applying it, so options cannot replace them. With Jev the extra fields are merged into the request body.

Keep provider options beside model construction rather than scattering them through route handlers.

## 4. Where to call it

`decide()` is an ordinary async function. Call it from a route handler, queue worker, `Pipeline.step()`, agent hook, tool handler, or a custom eval metric. Next, run many inputs with [Batches](/sdk/decisions/batches).
