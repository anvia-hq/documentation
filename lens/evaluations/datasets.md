# Datasets

Datasets give an evaluation suite a stable set of cases. Lens presents two kinds of dataset because discovering useful cases and maintaining a release test set are different jobs.

| Dataset type | Created from | Best used for |
| --- | --- | --- |
| **Observed** | Evaluation runs reported to Lens | Inspecting what a suite actually ran and finding cases worth keeping. |
| **Managed** | Cases curated and versioned in Lens | Running a repeatable suite against an immutable test set. |

An observed dataset is evidence. A managed dataset is a test fixture. A common workflow starts with the former and promotes a clean version into the latter.

```text
Evaluation telemetry
        ↓
Observed dataset
        ↓ review payloads and conflicts
Managed draft
        ↓ edit and publish
Immutable version
        ↓ fetch from evaluation code
Evaluation run
```

## Choose the right starting point

Use an **observed dataset** when the cases are already defined in evaluation code and you want Lens to catalog them. Lens groups runs by the `datasetName` and `datasetVersion` reported with each run.

Use a **managed dataset** when the case list should live outside application code, be edited by the team, and remain reproducible after publication. Evaluation code fetches a published version with the project ingestion credentials.

Do not use either kind as application storage. Datasets are for evaluation inputs, expected values, optional context, and test metadata—not conversation history or production records.

## A practical path

1. Report a suite with a stable dataset name, version, and case IDs.
2. Open **Evaluations → Datasets → Observed** and inspect the reconstructed version.
3. Resolve missing payloads or conflicting case definitions in the evaluation instrumentation.
4. Select **Save as managed** when the observed version is complete.
5. Edit the new draft, then publish it.
6. Fetch that published version in evaluation code and record its name and version on the next run.

Continue with [Observed datasets](/lens/evaluations/datasets/observed) to understand reconstruction, or start with [Managed datasets](/lens/evaluations/datasets/managed) when you already know the cases you want to maintain.

## Access and data handling

All project members can view datasets. Creating, editing, publishing, importing, or archiving managed datasets requires the project `owner` or `admin` role.

Dataset cases may contain user prompts, expected answers, retrieved passages, and metadata. Treat them as retained application data: use synthetic or reviewed examples where possible, exclude secrets, and make payload capture an explicit decision.

