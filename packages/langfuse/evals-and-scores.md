# Evals and scores

Publish Anvia evaluation metrics with `createLangfuseEvalReporter()` or combine an evaluation and Langfuse dataset run with `runEvalAsExperiment()`.

```ts
const reporter = createLangfuseEvalReporter(tracing, {
  onMissingTrace: 'warn',
  includeMessages: false,
})
```

Numeric, categorical, and boolean outcomes preserve their Langfuse data type. Metric configuration, metadata, trace references, and input or expected summaries are included according to reporter options.

## Direct scores

```ts
await tracing.score({
  traceId,
  observationId,
  name: 'quality',
  value: 1,
  dataType: 'NUMERIC',
})
```

Direct sending is the default. Set `scoreBatchSize` to enable the in-memory queue; it drains by size, interval, `flushScores()`, `flush()`, or `shutdown()`. Retryable 429 and 5xx responses use bounded exponential backoff.

If retries are exhausted, `LangfuseScoreError.scores` contains the failed payloads. The queue is process memory, not durable storage, so use a job system when score delivery must survive restarts.
