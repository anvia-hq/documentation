# `@anvia/langfuse` API reference

```ts
import {
  LangfuseClient,
  LangfuseScoreError,
  createPiiRedactor,
  DEFAULT_PATTERNS,
} from '@anvia/langfuse'
```

## `LangfuseClient`

```ts
const langfuse = new LangfuseClient(options)
const observer = langfuse.observer(observerOptions)
const reporter = langfuse.evalReporter<Input, Output, Expected>(reporterOptions)
const prompts = langfuse.promptClient(promptOptions)
const datasets = langfuse.datasetClient(datasetOptions)

await langfuse.score({ traceId, name, value })
await langfuse.flush()
await langfuse.close()
```

Client options include credentials, base URL, environment, release, service name, timeout, and score-queue settings. Capture mode and PII redaction belong to `observer()` options.

## Prompts

```ts
const text = await prompts.getPromptText({ name: 'support', label: 'production' })
const chat = await prompts.getPromptChat({ name: 'support', version: 12 })
const prompt = await prompts.getPrompt({ name: 'support' })
prompts.refresh()
```

## Datasets and experiments

```ts
await datasets.createDataset({ name, description, metadata })
await datasets.upsertItems({ name, items })
const dataset = await datasets.getDataset<Input, Expected>({ name })
const result = await datasets.runExperiment({ datasetName, runName, items, run })
```

`langfuse.runEvalExperiment({ suite, experiment })` runs an Anvia suite and publishes the matching Langfuse dataset run. Experiment options control dataset/run names, score publication, reporter options, contexts, pagination, and timeout.

## Redaction and public types

`createPiiRedactor()` creates the standalone redactor. The package exports `Langfuse*` option and result types for tracing, scores, evals, prompts, datasets, and experiments.
