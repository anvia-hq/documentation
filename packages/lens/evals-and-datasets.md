# Evals and datasets

One `LensClient` creates the observer and reporter used by an evaluation run.

```ts
import { agentEvalTarget, runEvalSuite } from '@anvia/core/evals'
import { LensClient } from '@anvia/lens'

const lens = new LensClient({ serviceName: 'support-evals' })
const observer = lens.observer()
const reporter = lens.evalReporter({
  includeMetadata: true,
  includePayloads: false,
})

try {
  await runEvalSuite({
    name: 'support-regression',
    cases,
    target: agentEvalTarget<string>({
      agent,
      request: ({ input }) => ({ prompt: input }),
    }),
    metrics,
    reporters: [reporter],
  })
  await lens.flush()
} finally {
  await lens.close()
}
```

`agent`, `cases`, and `metrics` are application-owned fixtures in this fragment. Construct the target Agent with `observability: { observers: { lens: observer }, primaryTrace: 'lens' }`. A custom registry name must match both `primaryTrace` and reporter `traceObserver` (default `lens`). The reporter can then correlate metric results with its traces. `onMissingTrace` (default `emit`) decides what happens to a result without a valid trace and observation ID: `emit` sends it uncorrelated, `ignore` drops it, `warn` drops it and logs a console warning, and `throw` raises an error. `runEvalSuite` collects reporter errors into `result.reporterErrors` by default, so pass `reporterErrorPolicy: 'throw'` when a missing trace must fail the run.

## Read a managed dataset

```ts
const datasets = lens.datasetClient()
const dataset = await datasets.getDataset<string, string>({
  name: 'support-cases',
  version: 'v2',
})
```

The client reads published immutable versions and follows at most 100 pages. Default `pageSize: 50` supports 5,000 items; `pageSize: 100` supports 10,000. Larger populations throw `LensDatasetError` with `code: 'pagination_limit'`; partition larger datasets rather than expecting a partial return. Omitting `version` selects the latest published version. Pin a version in CI so repeated runs evaluate the same cases.

Each item exposes `{ id, input, expected?, context?, retrievalContext?, tags?, metadata? }`. `tags` arrives as a string array and `metadata` as a JSON object, so `dataset.items` passes straight into `runEvalSuite` and a tag filter can select managed cases:

```ts
const cases = dataset.items
await runEvalSuite({ ...suite, cases, tags: ['smoke'] })
```

A response whose `tags` is not a string array or whose `metadata` is not a JSON object is rejected as `invalid_response` rather than coerced. `LensDatasetError.code` is `network_error`, `invalid_response`, `pagination_limit`, or the API's own error code, with a `request_failed` fallback; `status` is absent only for `network_error`; invalid JSON and other `invalid_response` errors carry the HTTP status of the response that failed validation.

The public client is read-only: dataset drafting, publishing, archiving, comparison, and quality-gate configuration live in Lens.
