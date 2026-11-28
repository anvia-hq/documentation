# Evaluation results

A suite result is a gate, not just a log. The runner returns totals, per-metric summaries, per-case records, and usage or cost, and `passed` already applies the trial rules described in [Trials and caching](/sdk/evaluations/trials-and-caching).

## Suite totals

```ts
const result = await runEvalSuite(suite)

result.passed            // cases.failed === 0 && cases.invalid === 0
result.cases             // { total, passed, failed, invalid }
result.metrics           // the same shape, counted per metric judgment
result.name              // the suite name
result.durationMs        // wall-clock run duration
result.run               // { id, startedAt, completedAt, datasetName?, datasetVersion?, promptRef?, metadata? }
result.usage             // { target, evaluation, total }
result.cost              // only when the suite configures `cost`
result.metricSummaries   // Record<metricName, EvalMetricSummary>
```

`result.passed` is the readiness check for a quality gate. Branch on it instead of re-deriving the rule from counts.

## Metric summaries

`metricSummaries` is keyed by metric name, including a custom `name` you pass:

```ts
type EvalMetricSummary = {
  metricName: string
  required: boolean
  direction?: 'higher_is_better' | 'lower_is_better'
  threshold?: number
  total: number
  passed: number
  failed: number
  invalid: number
  passRate: number
  meanScore?: number
  minScore?: number
  maxScore?: number
  meanDurationMs: number
}
```

`passRate` is the actionable number for a quality gate. `meanScore`, `minScore`, and `maxScore` exist only for metrics that project to numbers: a boolean metric reports `1` for a pass and `0` for a fail, while a judge that returns an object projects through its `projectScore`. `direction` and `threshold` are omitted when the metric does not declare them, so a budget metric such as `maxTurns(2)` reports `threshold: 2` with `lower_is_better`.

## Case records

```ts
result.results[0]
// {
//   case: { id, input, expected?, tags?, metadata?, context?... },
//   outcome: 'pass' | 'fail' | 'invalid',
//   targetStatus: 'succeeded' | 'failed',
//   output?, targetError?,
//   targetDurationMs, durationMs,
//   metrics: [...], scores: { [metricName]: EvalOutcome },
//   usage: { target, evaluation, total },
//   cost?, cached?, trials?
// }
```

`scores` is a map keyed by metric name. Read `scores.<metricName>.outcome`, `.score`, and `.comment` for one metric; the boolean or number a metric page calls "the score" is `scores.<metricName>.score`.

`usage` is always present. `usage.target` is empty for a cache hit, so a cached run reports zero target tokens and zero target cost while evaluation usage is still counted. `cost` appears only when the suite passes `cost`.

A failed target makes the case `invalid`, not `fail`, with each metric recorded as an invalid outcome naming the target failure. That distinction matters in CI: `invalid` means the suite could not judge, `fail` means it judged and rejected.

With `trials` greater than one, the case carries `trials`, and the case-level `output`, `metrics`, `scores`, and `cached` come from a representative trial: the first trial whose outcome matches the case outcome, otherwise the first trial. A failed multi-trial case therefore shows a failing trial's output, not the last one. `targetDurationMs` is the sum over trials while `durationMs` is wall-clock time.

## Fail-fast

`failFast: true` rejects with `EvalFailFastError` after the first completed required failure or invalid case:

```ts
try {
  await runEvalSuite({ ...suite, failFast: true })
} catch (error) {
  if (error instanceof EvalFailFastError) {
    error.caseId        // the case that tripped the gate
    error.outcome       // 'fail' | 'invalid'
    error.caseResult    // that case's full result, when it was recorded
    error.partialResults // every completed case, including this one
  }
}
```

The message is `Evaluation stopped after case <caseId> produced a required <outcome> outcome.` `partialResults` never contains cases that were still running, so it is safe to report or persist.

## Progress events

`onProgress` receives four case-level events: `case-start`, `target-complete`, `metric-complete`, and `case-complete`. There are no run-level events; read run totals from the returned result. `case-complete` carries a result whose `usage` and `cost` are already computed; `target-complete` and `metric-complete` carry neither, so read those from the case result rather than from every event.

A throw (or rejected promise) from `onProgress` is not swallowed and does not become an invalid case: the runner awaits each event, so the error rejects `runEvalSuite` itself. Keep progress handlers non-throwing.

## Formatting and persistence

`formatEvalResult(result, options)` returns a string; `printEvalResult(result, options)` writes it. Both accept `format` (`'pretty'`, `'json'`, or `'quiet'`), `onlyFailures`, `color`, `maxValueLength`, and a `redact` callback. `format: 'quiet'` writes nothing.

Use [`saveEvalResult`](/sdk/evaluations/cli-and-baselines#store-and-compare-baselines) when you want a durable baseline instead of printed output.

Redaction applies to printed output and to serialized payloads. Unredacted JSON can contain inputs, outputs, metadata, and error details, so treat a result file as sensitive as the data it evaluated.
