# Observed datasets

An observed dataset is reconstructed from evaluation runs that report the same dataset name and version. It lets you verify the cases Lens received before turning them into maintained test data.

Open **Evaluations → Datasets → Observed**. The list shows each dataset's latest version, number of versions, run count, and most recent activity. Open a dataset to inspect its versions, cases, payload state, and associated runs.

## Report a recognizable dataset

Give the suite a durable dataset identity and stable case IDs:

```ts
const result = await runEvalSuite({
  name: 'support-policy-regression',
  run: {
    datasetName: 'support-policy-cases',
    datasetVersion: 'v1',
  },
  cases: [
    {
      id: 'refund-window',
      input: 'How long are refunds available?',
      expected: '30 days',
    },
  ],
  target,
  metrics,
  reporters: [lensEvaluation.reporter],
})
```

The suite name identifies what is being measured. The dataset name and version identify the case collection. Keep those concerns separate: several suites may legitimately run against the same dataset.

## Capture case definitions intentionally

Observed reconstruction needs the evaluation payload, not only the outcome. Enable evaluation payloads when creating the Lens integration:

```ts
import { lens } from '@anvia/lens'

const lensEvaluation = lens.evals({
  includePayloads: true,
  includeMetadata: true,
})
```

`includePayloads` is the relevant evaluation setting. Without it, Lens can still show scores and outcomes, but cannot reconstruct a usable input and expected value for every case.

Payload capture can retain sensitive text. Review [Capture and privacy](/lens/connect/anvia/capture-and-privacy) before enabling it for production-derived cases.

## Understand version status

Lens examines completed runs for the selected dataset version and assigns one status:

| Status | Meaning | Next action |
| --- | --- | --- |
| **Complete** | At least one completed run contains every declared case with captured payloads, and complete snapshots agree. | Review the cases, then save as managed if they are useful. |
| **Incomplete** | Lens cannot find a completed run with a captured definition for every case. | Check run completion and evaluation payload capture, then rerun the suite. |
| **Conflict** | Complete runs with the same dataset version contain different case definitions. | Fix the inputs, expected values, or version label before promotion. |

Lens selects the earliest complete snapshot as the canonical run. It compares the case definition—input, expected value, context, and retrieval context—across complete runs. A changed model output does not create a dataset conflict.

::: warning A version is a contract
If a case definition changes intentionally, report a new dataset version. Reusing `v1` for different inputs makes historical comparisons ambiguous and can put the observed version into conflict.
:::

## Promote a version

Owners and admins see **Save as managed** only for a complete version. Choose a managed dataset name and draft version label. Lens copies the observed cases into a new editable draft; the observed telemetry remains unchanged.

Promotion fails when any case lacks a captured payload or when complete snapshots conflict. Do not work around that check by manually recreating an uncertain dataset—repair the source run or create a clearly named managed dataset from reviewed cases.

After promotion, continue with [Managed datasets](/lens/evaluations/datasets/managed).
