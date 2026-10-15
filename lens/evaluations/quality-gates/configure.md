# Configure gates

Open **Evaluations → Quality gates**, then select **New gate**. Owners and admins can create or edit a gate; other project members can inspect the saved policy.

![Lens quality gate configuration with scope and approval rules](/images/lens/quality-gate.png)

## Define the scope first

Enter a recognizable name, the exact evaluation suite name, and the exact environment reported by the candidate and baseline runs. Scope matching is case-sensitive because it uses the emitted values.

Set **Minimum evaluated cases** for run-wide population (1–1,000,000). It counts distinct cases across
all metrics and outcomes, including invalid judgments; configure per-metric evidence below as well.

Every gate requires at least one approval rule and supports at most 25.

## Metric meets a target

Use this rule for an absolute requirement on a named evaluator:

```text
correctness pass rate is at least 95%
toxicity average score is at most 0.10
```

Choose `pass rate` or `average score`, then `at least` or `at most`. Pass-rate values are entered as percentages in the UI. Average score requires numeric evaluation results; it is unavailable for a purely categorical or Boolean metric with no numeric value.

The verdict is `insufficient_data` if the named metric is absent or its candidate measure cannot be calculated.

## Metric change stays within a limit

Use this rule to protect a baseline-relative quality measure:

```text
correctness pass rate may decrease by no more than 2 percentage points
verbosity average score may increase by no more than 0.10
```

Pass-rate regression uses **percentage points**, not relative percentage. A change from 96% to 93% is a three-point decrease and fails a two-point limit.

This rule needs the metric and measure on both candidate and baseline. If either required value is missing, the result is `insufficient_data`.

## Require valid evidence per metric

Enable **Require valid evidence** on threshold and regression rules. A 100% pass rate can mean
one pass and 99 invalid judgments, because invalid and unknown outcomes are excluded from its
denominator. A run-wide case minimum cannot establish usable coverage for a particular metric.

| Setting | Contract |
| --- | --- |
| `minimumValidCases` | 1–1,000,000 distinct nonempty case IDs with usable judgments for this metric. |
| `maxInvalidRate` | Maximum invalid judgments / all judgments for the metric; fraction 0–1 in the API. |
| `maxUnknownRate` | Maximum unknown judgments / all judgments for the metric; fraction 0–1 in the API. |

Provide all three settings together. The UI displays rate budgets as percentages. For `pass_rate`,
both pass and fail judgments are valid evidence, including expected negative controls. Repeated
judgments for one case and cases from other metrics cannot fill the case minimum. Unnamed judgments
affect rates but do not count toward that minimum. Equality with a rate budget is allowed.

For `average_score`, evidence-enabled rules count and average only usable judgments with finite
numeric scores. Invalid/unknown scores cannot fill the minimum or influence that average. Without
evidence settings, the historical average over all numeric scores is preserved.

Threshold rules check the candidate. Regression rules check both candidate and baseline. Missing
required evidence, too few valid cases, or an exceeded invalid/unknown budget yields
`insufficient_data`; a quality threshold or regression miss yields `fail`.

```json
{
  "type": "evaluation_threshold",
  "metricName": "correctness",
  "measure": "pass_rate",
  "operator": "gte",
  "value": 0.95,
  "evidence": {
    "minimumValidCases": 50,
    "maxInvalidRate": 0.01,
    "maxUnknownRate": 0
  }
}
```

New UI metric rules start with one valid case and zero invalid/unknown tolerance. Increase the
minimum for your release policy; one is an editing default. Existing saved rules and API-created
rules without `evidence` retain their old behavior. Explicitly enable **Require valid evidence**
to upgrade a rule; editing its name or quality target alone does not enable it. No database migration
is required.

## Operational metric stays within a limit

Operational rules limit the candidate's percentage increase in:

- P95 trace duration.
- Average total tokens.

For example, a maximum increase of `15%` passes when latency changes from 1,000 ms to 1,120 ms and fails at 1,160 ms.

These rules require complete trace coverage for both runs, a candidate value, and a positive baseline value. Otherwise Lens returns `insufficient_data`. This prevents missing telemetry from looking like an operational improvement.

## A balanced first gate

For a production candidate, start with a small number of rules that have clear ownership:

| Requirement | Example |
| --- | --- |
| Population | At least 50 evaluated cases, plus 50 valid cases for each required metric. |
| Evidence quality | Explicit invalid and unknown budgets, for example 1% and 0%. |
| Quality floor | `correctness` pass rate at least 95%. |
| Regression budget | `correctness` pass rate decreases by no more than 2 points. |
| Operational budget | P95 trace duration increases by no more than 15%. |

Add a rule only when the metric is reported consistently and the team knows what action to take when it fails. A large collection of fragile rules produces `insufficient_data` more often than useful release decisions.

## Validate in Compare

Open [Compare releases](/lens/evaluations/compare), select compatible candidate and baseline runs, then choose the gate. Read every rule result—not only the overall badge—before copying the gate ID into CI.
