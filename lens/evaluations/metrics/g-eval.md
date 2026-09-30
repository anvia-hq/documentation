# gEval

Uses explicit evaluation steps or criteria to score a custom quality requirement.

## When to use

A product-specific quality rule needs explicit evaluation steps or a rubric.

## Why use it

It makes the judge's scoring procedure and selected evidence visible.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { gEval, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'g-eval-example',
  cases: [
    {
      id: 'refund-rubric',
      input: 'How long are refunds available?',
      expected: '30 days',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    gEval({
      name: 'refund-policy-quality',
      model: judgeModel,
      evaluationParams: ['input', 'actualOutput', 'expectedOutput'],
      evaluationSteps: [
        'Check that the answer states the expected refund window.',
        'Check that the answer adds no unsupported exceptions.',
      ],
      threshold: 0.8,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The judge’s raw score is normalized to 0–1. With the default raw range of 0–10, an 8 becomes `0.8` and passes this example. The outcome metadata includes the steps and raw score.

## What it needs

Requires `model`, unique `name`, `evaluationParams`, and exactly one of `criteria` or `evaluationSteps`. Returns a normalized 0–1 score. `rubric` is optional.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Provide exactly one of `criteria` or `evaluationSteps`. With `criteria`, a judge first generates evaluation steps. `evaluationParams` chooses the evidence the judge sees; selecting `expectedOutput`, `context`, or `retrievalContext` requires the corresponding case field or selector. An optional `rubric` describes score ranges and expected outcomes.

Use `evaluationParams` to include only the evidence needed for this rubric.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[llmScore](/lens/evaluations/metrics/llm-score), [llmJudge](/lens/evaluations/metrics/llm-judge).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
