# Prompts and data

The package includes focused clients for Langfuse prompts and datasets. They reuse resolved credentials from the tracing instance.

## Managed prompts

```ts
import { createLangfusePromptClient } from '@anvia/langfuse'

const prompts = createLangfusePromptClient(tracing)
const instructions = await prompts.getPromptText('support-agent', {
  label: 'production',
})
```

Text and chat prompts are supported. Results are cached in memory for 60 seconds by default and keyed by name, version, and label. Pass `refresh: true` for a request-level refresh or call `refresh()` to clear the client cache.

## Datasets

```ts
import { createLangfuseDatasetClient } from '@anvia/langfuse'

const datasets = createLangfuseDatasetClient(tracing)
await datasets.createDataset({ name: 'support-cases' })
await datasets.upsertItems('support-cases', cases)
const dataset = await datasets.getDataset('support-cases')
```

The dataset client can create datasets, paginate items, upsert cases, and publish experiment run items. Per-item experiment failures are returned in `errors`; successful items can still be posted.

Prompt and dataset calls are ordinary authenticated HTTP requests. Plan for timeouts, transient network failures, cache staleness, and schema validation at the application boundary.
