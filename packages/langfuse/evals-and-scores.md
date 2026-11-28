# Evals and scores

Create an Anvia evaluation reporter from the owning client:

```ts
const reporter = langfuse.evalReporter({
  onMissingTrace: 'throw',
  publishInvalid: true,
})

const result = await runEvalSuite({
  ...suiteOptions,
  reporters: [reporter],
  reporterErrorPolicy: 'throw',
})
```

Reporter options and defaults:

| Option | Default | Effect |
| --- | --- | --- |
| `onMissingTrace` | `'ignore'` | `ignore` drops a result without a matching trace, `warn` drops it and logs, `throw` raises |
| `publishInvalid` | `false` | Invalid outcomes are skipped unless `true` |
| `traceObserver` | `'langfuse'` | Only trace references from this observer name are scored |
| `truncateInputAt` | `2048` | Byte limit for the case input and expected summaries in score metadata |
| `includeMessages` | `true` | Include the target output's messages in score metadata |
| `includeContext` | `false` | Include case `context` and `retrievalContext` in score metadata |

The defaults drop uncorrelated and invalid results silently. Set `onMissingTrace: 'throw'` and `reporterErrorPolicy: 'throw'` together, as above, when every score must reach Langfuse; with only the reporter option, the error lands in `result.reporterErrors`.

For a combined Anvia suite and Langfuse dataset experiment, use:

```ts
const result = await langfuse.runEvalExperiment({
  suite: suiteOptions,
  experiment: {
    datasetName: 'support-cases',
    runName: 'candidate-v3',
    publishScores: true,
  },
})
```

You can also publish an application-owned score with `langfuse.score({ traceId, name, value })`. `score()` rejects a missing or empty `traceId` even though the type marks it optional, and it throws when the client has no `publicKey` and `secretKey`. Flush or close the client before a short-lived process exits so queued scores are delivered.
