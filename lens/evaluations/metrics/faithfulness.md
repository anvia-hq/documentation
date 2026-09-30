# faithfulness

Checks whether factual claims in the answer are supported by retrieved evidence.

## When to use

Check whether factual answer claims are supported by retrieved passages.

## Why use it

It tests grounding claim by claim.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { faithfulness, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'faithfulness-example',
  cases: [
    {
      id: 'grounded-policy',
      input: 'How long are refunds available?',
      retrievalContext: ['Refunds are available for 30 days.'],
    },
  ],
  target: async () => 'Refunds are available for 30 days, and every refund includes a bonus credit.',
  metrics: [
    faithfulness({
      model: judgeModel,
      threshold: 1,
      penalizeAmbiguousClaims: true,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

If the judge extracts two claims and only the refund-window claim is supported, the score is `0.5`. That fails this example’s threshold of `1`.

## What it needs

Requires a completion `model` and nonempty `case.retrievalContext` or `retrievalContext`. Higher is better: the fraction of claims judged supported. Ambiguous claims count as supported by default; set `penalizeAmbiguousClaims: true` to change that.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Supply nonempty `case.retrievalContext` or the metric’s `retrievalContext` option. Ambiguous support counts as supported by default; this example penalizes it. No extracted factual claims produces a score of 1, so also check that the answer is useful and nonempty. `truthsExtractionLimit` optionally limits extracted source facts.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[hallucination](/lens/evaluations/metrics/hallucination), [answerRelevancy](/lens/evaluations/metrics/answer-relevancy), [abstention](/lens/evaluations/metrics/abstention).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
