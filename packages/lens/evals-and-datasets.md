# Evals and datasets

`lens.evals()` bundles an observer, evaluation reporter, and lifecycle methods for evaluation scripts.

```ts
import { agentEvalTarget, runEvalSuite } from '@anvia/core/evals'
import { lens } from '@anvia/lens'

const integration = lens.evals({
  serviceName: 'support-evals',
  includeMetadata: true,
  includePayloads: false,
})

try {
  await runEvalSuite({
    name: 'support-regression',
    cases,
    target: agentEvalTarget(agent),
    metrics,
    reporters: [integration.reporter],
  })
} finally {
  await integration.shutdown()
}
```

The reporter can correlate metric results with traces, group evaluation runs, and flush on run completion. `onMissingTrace` decides whether an uncorrelated result is emitted, ignored, warned about, or rejected.

## Read a managed dataset

```ts
import { createLensDatasetClient } from '@anvia/lens'

const datasets = createLensDatasetClient(integration.observer)
const dataset = await datasets.getDataset('support-cases', {
  version: 'v2',
})
```

The client reads published immutable versions, authenticates with the observer's resolved credentials, and paginates automatically. Omitting `version` selects the latest published version. Pin a version in CI so repeated runs evaluate the same cases.

The public client is read-only: dataset drafting, publishing, archiving, comparison, and quality-gate configuration live in Lens.
