# Quality gates

A quality gate converts a release comparison into a repeatable approval policy. It belongs to one project and applies to one exact evaluation suite and environment.

Use a gate when “the candidate looks acceptable” needs to become explicit rules such as:

- Evaluate at least 50 cases.
- Keep correctness pass rate at or above 95%.
- Allow no more than a two-percentage-point correctness regression.
- Keep P95 trace duration within 15% of the baseline.

## How a gate is evaluated

```text
Completed candidate + completed baseline
                ↓
Same suite and environment
                ↓
Minimum case count + every configured rule
                ↓
pass | fail | insufficient_data
```

The candidate and baseline must be different completed runs with the same suite and environment. The gate must match that same scope.

## Interpret the verdict

| Verdict | Meaning | Release action |
| --- | --- | --- |
| `pass` | The minimum case count and every rule passed. | The gate approves this comparison. |
| `fail` | At least one calculable rule exceeded its limit. | Investigate the failed rules and changed cases. |
| `insufficient_data` | Lens could not calculate one or more requirements. | Fix the evidence; do not treat it as approval. |

A failure takes precedence over insufficient data when both occur. Otherwise, any insufficient rule makes the overall verdict `insufficient_data`.

## What a gate does not do

Lens evaluates and records the policy result. The web comparison does not merge a pull request, deploy a service, or stop a build. Use the authenticated public endpoint described in [CI enforcement](/lens/evaluations/quality-gates/ci) when the verdict must control automation.

Quality gates are also available as an alert signal. A **Failed quality gate** alert can open an in-product incident for `fail` or `insufficient_data`; a later passing check for the same gate and run pair resolves it. See [Alert rules](/lens/observability/alerts/rules).

## Ownership

All project members can view gates and apply them in Compare. Only owners and admins can create, edit, or delete them. Gate names are unique within a project, ignoring case.

Deleting a gate also removes alert rules that depend on it. It does not remove earlier evaluation runs.

Start with [Configure gates](/lens/evaluations/quality-gates/configure), then wire the stable policy into [CI enforcement](/lens/evaluations/quality-gates/ci).

