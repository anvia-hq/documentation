# `@anvia/lens` API reference

```ts
import {
  LensClient,
  LensDatasetError,
  resolveLensConfig,
  createLensRedactor,
  DEFAULT_PATTERNS,
} from '@anvia/lens'
```

## `LensClient`

```ts
const lens = new LensClient(options)
const observer = lens.observer(observerOptions)
const reporter = lens.evalReporter<Input, Output, Expected>(reporterOptions)
const datasets = lens.datasetClient(datasetOptions)

await lens.flush()
await lens.close()
```

Client options include `baseUrl`, `publicKey`, `secretKey`, `serviceName`, `environment`, `release`, `timeoutMs`, capture/redaction defaults, and `optional`. The readonly `enabled` flag is false only when optional mode has no configured connection.

`observer()` returns an `AgentObserver`. `evalReporter()` returns an Anvia `EvalReporter`; its options include `traceObserver`, `publishInvalid`, `includeMetadata`, `includePayloads`, and `onMissingTrace`.

## Managed datasets

```ts
const dataset = await lens.datasetClient({ pageSize: 50 }).getDataset<Input, Expected>({
  name: 'support-cases',
  version: 'v2',
})
```

The returned `LensDataset` contains `name`, `version`, optional description and metadata, and normalized items. `LensDatasetError` exposes `status` and a stable `code`.

## Redaction

`createLensRedactor(options)` returns the package redactor. Supplying custom `patterns` replaces `DEFAULT_PATTERNS`; include the defaults explicitly when both sets are required.

## Public types

The package exports client, observer, capture, redaction, evaluation-reporter, and dataset option/result types named with the `Lens*` prefix.
