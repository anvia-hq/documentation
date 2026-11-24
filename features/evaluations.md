# Evaluations

Evaluations turn expected agent behavior into repeatable pass, fail, or invalid evidence. Run suites with `@anvia/core/evals` in tests or CI, then report them to Lens to compare releases and enforce quality gates.

## When to use it

- A prompt, model, tool, or retrieval change must not regress behavior that already works.
- A release needs an explicit, repeatable approval rule instead of manual spot checks.
- A failing case should link to the agent trace that produced it.
- Production feedback, such as thumbs up or down, should be attached to the trace it rates.

## How it works

A suite runs each case's input through a target, such as a function or an agent wrapped with `agentEvalTarget()`, then applies metrics to the output. Deterministic metrics such as `exactMatch`, `contains`, and `requiredFields` need no provider. Trajectory metrics such as `toolCalled` and `maxTurns` check how an agent ran, while `llmJudge`, `llmScore`, and `semanticSimilarity` call a model.

```ts
import { defineEvalSuite, exactMatch, runEvalSuite } from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'ticket-normalization',
  cases: [
    { id: 'trim', input: ' checkout failed ', expected: 'checkout failed' },
    { id: 'collapse-spaces', input: 'password   reset', expected: 'password reset' },
  ],
  target: async (input) => input.trim().replace(/\s+/g, ' '),
  metrics: [exactMatch({ name: 'normalized' })],
  caseTimeoutMs: 5_000,
})

const result = await runEvalSuite(suite)

if (result.cases.failed > 0 || result.cases.invalid > 0) {
  throw new Error('Ticket normalization regression.')
}
```

For CI, `runEvalCli({ ...suite, exitCode: true })` sets exit code `1` for required failures and `2` for required invalid judgments. Trials, caching, stored baselines, and target comparisons build on the same runner.

To keep history, pass `lens.evalReporter()` from `@anvia/lens` in `reporters`. Lens links each result to its trace, catalogs observed datasets, serves versioned managed datasets, compares a candidate run with a baseline, and evaluates quality gates as `pass`, `fail`, or `insufficient_data`. For live traffic, `lens.score()` records feedback or other scores against an existing trace without a suite.

## What your application owns

- **Thresholds and release decisions**: the runner reports outcomes, and Lens records gate verdicts. Your CI decides whether a build, merge, or deployment proceeds.
- **Case data**: use approved or synthetic inputs, and redact private data before sending it to external judges or reporters. `includePayloads` controls whether case inputs and outputs reach Lens.
- **Side effects**: an eval runs the real agent and its tools. Keep approval responders specific to synthetic cases; approval never replaces authorization in the tool handler.
- **Credentials and cost**: provider keys and Lens project keys stay server-side, and model-graded metrics add evaluation usage separate from target usage.
- **Feedback authorization**: authenticate and authorize a request before recording it with `source: 'end_user'`.

## Go deeper

- [Evaluations](/sdk/evaluations): suites, agent targets, metrics, execution control, and expectations
- [Evaluation results](/sdk/evaluations/results): totals, metric summaries, case records, and formatting
- [Trials and caching](/sdk/evaluations/trials-and-caching): repeated sampling, tag filters, and target caches
- [CLI and baselines](/sdk/evaluations/cli-and-baselines): exit codes, stored baselines, and comparing targets
- [Lens evaluations](/lens/evaluations): the evaluation model in Lens and a practical workflow
- [Run evaluations with Lens](/lens/evaluations/run-evaluations): reporter setup and trace correlation
- [Built-in metrics](/lens/evaluations/metrics): every metric and its call forms
- [Datasets](/lens/evaluations/datasets): observed and managed datasets
- [Compare releases](/lens/evaluations/compare) and [Quality gates](/lens/evaluations/quality-gates): release verdicts and CI enforcement
- [Runtime scoring](/packages/lens/runtime-scoring): record production feedback with `lens.score()`
