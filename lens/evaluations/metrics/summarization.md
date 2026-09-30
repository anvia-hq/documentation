# summarization

Checks whether a summary preserves important source facts and stays grounded.

## When to use

A summary must cover key source facts without adding unsupported claims.

## Why use it

It checks both coverage and grounding.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { summarization, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'summarization-example',
  cases: [
    {
      id: 'policy-summary',
      input: 'Refunds are available for 30 days. A receipt is required.',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    summarization({
      model: judgeModel,
      assessmentQuestions: [
        'Are refunds available for 30 days?',
        'Is a receipt required?',
      ],
      threshold: 0.8,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The summary may be fully grounded but cover only one of the two source-supported assessment questions. If alignment is `1` and coverage is `0.5`, the final score is `0.5` and fails.

## What it needs

Requires a completion `model`; uses the case input as source text and output as summary. Higher is better: the lower of its coverage and claim-alignment scores.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

The case input is the source text; output is the summary. The final score is the lower of alignment and coverage. Provide your own `assessmentQuestions` for stable checks, or let the judge generate them (`questionCount` defaults to 5). A missing set of claims or no source-supported questions gives the corresponding component a score of 0.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[faithfulness](/lens/evaluations/metrics/faithfulness), [gEval](/lens/evaluations/metrics/g-eval).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
