# Versions and publishing

Managed dataset versions separate editing from execution. A draft can change; a published version cannot. This makes an evaluation result explainable later because its case set still has a precise identity.

## Lifecycle

```text
Create dataset
      ↓
v1 draft ── edit, import, delete cases
      ↓ publish
v1 published ── immutable and fetchable
      ↓ create new version
v2 draft ── copied from latest published version
```

A dataset can have only one draft at a time. After publishing it, **New version** creates another draft and copies the latest published cases into it. The new version label must be unique within the dataset.

## Work safely in a draft

Use the draft for all changes:

- Add a case with a stable ID.
- Edit its input, expected value, context, retrieval context, or metadata.
- Import JSONL to upsert a reviewed batch.
- Remove obsolete cases.

Publishing is rejected while the draft is empty. Once published, its cases cannot be added, edited, imported, or deleted. Create the next draft instead.

Lens does not prescribe semantic versioning. Labels such as `v2`, `2026-08-11`, or `policy-2026-08` are valid. Choose a convention that communicates why the test population changed, then avoid reusing labels.

## Publish deliberately

Before selecting **Publish version**, check:

1. Every case ID is stable and meaningful.
2. Inputs and expected values contain no unreviewed secrets or personal data.
3. Expected values describe the desired behavior, not an accidental current output.
4. Critical categories have enough cases.
5. The version label matches the release or dataset convention used by the team.

Publishing records the publication time and makes the version available through `createLensDatasetClient`.

## Pin versions for reproducibility

This fetches a fixed version:

```ts
const dataset = await datasetClient.getDataset('support-policy-cases', {
  version: 'v2',
})
```

This fetches the latest published version:

```ts
const dataset = await datasetClient.getDataset('support-policy-cases')
```

Latest is convenient during interactive development. A pinned version is safer for a baseline, a release comparison, and CI. Always record the returned `dataset.name` and `dataset.version` in the evaluation run, even when the requested version was implicit.

## Evolve a dataset without losing comparability

Changing cases and changing the system under test answer different questions. When possible:

- Compare a candidate and baseline on the **same dataset version** to isolate the release change.
- Create a new dataset version when the evaluation population changes.
- Run both releases on the new version before using that version for a release verdict.

Lens permits comparison across different dataset names or versions, but warns about the mismatch. That comparison can be informative; it is weaker evidence of a release regression because both the system and test population changed.

Continue to [Compare releases](/lens/evaluations/compare) once both variants have completed runs.

