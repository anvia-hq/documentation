# Quality gates

**Level:** Application

## Outcome

Convert a versioned eval suite into a deployment decision with explicit thresholds, critical-case
rules, and artifacts that reviewers can inspect.

## When to use it

Use a gate for prompt, model, retrieval, tool, or SDK changes. A gate should protect a defined product
risk, not optimize a single aggregate score.

## Setup

Install `@anvia/core` and the provider packages required by the target and judge. Store the cases and
gate policy in version control, and configure CI secrets only for the job that runs model-backed
metrics.

## Gate flow

```text
candidate build -> eval suite -> metric outcomes -> application gate policy
                                               |-> pass: deploy eligible
                                               `-> fail: artifact + review
```

## Suite and policy boundaries

```ts
const result = await runEvalSuite(supportSuite);

const criticalIds = new Set(["refund-window", "account-deletion"]);
const criticalFailure = result.results.some((caseResult) =>
  criticalIds.has(caseResult.case.id) &&
  caseResult.metrics.some((metric) => metric.outcome.outcome !== "pass"),
);

const evaluated = result.metrics.passed + result.metrics.failed;
const passRate = evaluated === 0 ? 0 : result.metrics.passed / evaluated;
const gatePassed = !criticalFailure && result.metrics.invalid === 0 && passRate >= 0.95;

await writeArtifact({
  suite: result.name,
  runId: result.run.id,
  totals: result.metrics,
  passRate,
  gatePassed,
});

if (!gatePassed) process.exitCode = 1;
```

`writeArtifact`, the thresholds, critical cases, and deployment response are application/CI policy.
Anvia runs the suite and returns results; it does not decide what your organization may deploy.

## Expected behavior and failures

A critical-case failure blocks regardless of aggregate score. Invalid outcomes block because the
suite lacks evidence. The job publishes a compact summary plus detailed case results for diagnosis.
An evaluator outage should be distinguishable from a candidate quality regression.

Run the gate as a CI command and upload its JSON artifact even when it exits nonzero. The release job
should depend on this command rather than reinterpreting console output.

## Production adaptations

Compare the candidate with a pinned baseline, require a minimum sample size, slice by locale and
capability, and define a maximum regression per slice. Keep cost and latency budgets beside quality.
Use staged rollout and live monitoring because offline evals cannot cover all traffic.

## Security and ownership

Protect eval datasets and artifacts like production data. Do not expose hidden expected answers to
the agent prompt. Restrict who may change thresholds, judge prompts, and critical-case membership;
review those changes as carefully as product code.

## Tests

Test the gate function using fabricated suite results: all pass, one critical fail, noncritical
regression, invalid-only, and zero evaluated metrics. Add negative controls to the eval dataset and
verify they fail before trusting the gate.

## Source and extensions

- Start with [`08_evals/01-basic-metrics.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/08_evals/01-basic-metrics.ts).
- Use [Lens quality gates](/lens/evaluations/quality-gates) when Lens manages the reporting workflow.
- Extend with baseline comparison, confidence intervals, cost ceilings, and manual override audit logs.
