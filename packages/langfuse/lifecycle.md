# Lifecycle

Create one tracing instance per service or worker lifecycle, not per request.

```ts
const tracing = langfuse.create({
  scoreBatchSize: 20,
  scoreFlushIntervalMs: 500,
  scoreMaxRetries: 3,
})

try {
  await runWorker(tracing)
} finally {
  await tracing.shutdown()
}
```

`flush()` drains trace export and queued scores while keeping the integration usable. `shutdown()` performs final delivery and closes its telemetry resources. `flushScores()` drains only the score queue.

## Failure boundaries

- The score queue is not durable across process termination.
- Network timeout defaults to 30 seconds.
- After retry exhaustion, queued score delivery throws `LangfuseScoreError`.
- Dataset and prompt clients surface HTTP and parsing failures to the caller.
- `getCurrentTrace()` is not safe as concurrent request-local state.

Choose whether telemetry failure should fail a user request, fail only a background job, or be logged and retried outside the request path.
