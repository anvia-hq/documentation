# Evaluations

Evaluations compare a target's output with versioned product expectations. Import the runner, suites, metrics, and reporting types from `@anvia/core/evals`.

## Run an offline regression suite

Start with a deterministic target and metric so the suite runs without provider credentials:

```ts anvia-check
import { defineEvalSuite, exactMatch, runEvalSuite } from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'ticket-normalization',
  cases: [
    { id: 'trim', input: ' checkout failed ', expected: 'checkout failed' },
    { id: 'collapse-spaces', input: 'password   reset', expected: 'password reset' },
  ],
  target: async (input) => input.trim().replace(/\s+/g, ' '),
  metrics: [exactMatch({ name: 'normalized' })],
  targetConcurrency: 2,
  metricConcurrency: 1,
  caseTimeoutMs: 5_000,
})

const result = await runEvalSuite(suite)
console.log(result.cases, result.metrics)

// Treat invalid judgments as failures of the CI gate as well.
if (result.cases.failed > 0 || result.cases.invalid > 0) {
  throw new Error('Ticket normalization regression.')
}
```

Case IDs identify stable scenarios. Required metric failures make the case fail; a target or metric error can make it invalid. Inspect `result.results` for each case's output, target status, scores, metric outcomes, durations, and errors. Add a negative control that must fail when you test a custom metric.

## Evaluate an agent

Use `agentEvalTarget({ agent, request })` to adapt an agent. Map the input with `request: ({ input }) => ({ prompt: input })`, then select `output.output` in metrics that inspect the agent's validated response. The adapter expects a completed response; blocked and suspended outcomes need a deliberate test or continuation strategy. See the complete [agent evaluation example](/examples/production/evaluations).

Use `createEvalTypes<Input, Output, Expected>()` and `EvalOutcome.pass`, `.fail`, or `.invalid` for typed custom metrics. Cases must contain the expected or context fields implicitly required by their metrics; explicit value selectors can replace those requirements.

## Choose metrics and judges

Start with deterministic metrics such as `exactMatch`, `contains`, `matches`, `maxLength`, and `requiredFields`. `semanticSimilarity` calls an embedding model. `llmJudge`, `llmScore`, and task-specific judge metrics call a completion model and add evaluation usage, cost, and variance.

Choose a metric for a defined product requirement. Pin dataset, prompt, model, and evaluator versions before comparing changes. Use approved or synthetic inputs and redact private data before external judges or reporters. See the [metric reference](/lens/evaluations/metrics) and [quality gates](/examples/production/quality-gates).

## Control execution and report results

`targetConcurrency` and `metricConcurrency` bound those phases separately; `concurrency` is a shorthand for both. Targets receive an optional third argument with a case `signal`, and metrics receive `signal` in their context. Pass it to external calls.

`caseTimeoutMs` covers the target and its metrics. A suite-level `signal` stops scheduling and rejects on abort. `failFast: true` rejects with `EvalFailFastError` after the first completed required failure or invalid case; it is distinct from pipeline batch behavior.

Select cases with `caseIds`, `caseFilter`, or `shard: { index, count }`. `selectEvalCaseIds(previousResult)` selects failed and invalid cases for a rerun. `onProgress` receives case, target, metric, and completion events.

Reporters receive run-start, per-metric, and run-end contexts. Their default `reporterErrorPolicy: 'collect'` records dispatch errors; `'throw'` fails the run. Inspect `reporterErrors` even when the suite resolves. `targetUsage` selects target usage, and `cost` configures cost accounting; keep target and evaluation usage distinct.

Use `runEvalCli({ ...suite, exitCode: true })` for a CI exit code: `1` for required failures and `2` for required invalid judgments. `formatEvalResult()` formats results without printing. Both support truncation and redaction; unredacted JSON may contain inputs, outputs, metadata, and error details. Your CI owns thresholds and release decisions.

Continue with [observability](/sdk/observability) to correlate target runs with evaluation evidence.
