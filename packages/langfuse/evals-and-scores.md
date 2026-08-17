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

You can also publish an application-owned score with `langfuse.score({ traceId, name, value })`. Flush or close the client before a short-lived process exits so queued scores are delivered.
