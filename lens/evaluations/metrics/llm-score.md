# llmScore

Uses a model to score an answer against your criteria and return feedback.

## When to use

A custom criterion needs a graded result and feedback.

## Why use it

It distinguishes partial compliance from a simple yes/no judgment.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { llmScore, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'llm-score-example',
  cases: [
    {
      id: 'clear-policy',
      input: 'Explain the refund policy.',
      expected: 'Refunds are available for 30 days.',
    },
  ],
  target: async () => 'You can request a refund within 30 days of purchase.',
  metrics: [
    llmScore({
      model: judgeModel,
      criteria: 'The answer clearly explains the 30-day refund policy without inventing exceptions.',
      threshold: 0.8,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The judge returns `{ score, feedback }`. A score of `0.9` passes this example’s `0.8` threshold; a score of `0.6` fails. Feedback is also stored as the outcome comment.

## What it needs

Requires a completion `model`, `criteria`, and a 0–1 `threshold`. Returns `{ score, feedback }`; passes when `score` meets the threshold.

## Keep in mind

Scores must be between 0 and 1. Use narrow criteria and calibrate the threshold with reviewed examples. If you supply custom `instructions`, include your criteria there because those instructions replace the generated scoring instructions.

Use the optional `prompt` selector when the judge needs evidence beyond the default case input, expected value, and output.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[llmJudge](/lens/evaluations/metrics/llm-judge), [gEval](/lens/evaluations/metrics/g-eval).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
