# hallucination

Measures whether an answer contradicts trusted context passages.

## When to use

Check whether an answer contradicts trusted reference passages.

## Why use it

It measures factual conflict with each supplied context item.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { hallucination, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'hallucination-example',
  cases: [
    {
      id: 'policy-conflict',
      input: 'How long are refunds available?',
      context: ['Refunds are available for 30 days.'],
    },
  ],
  target: async () => 'Refunds are available for 90 days.',
  metrics: [
    hallucination({ model: judgeModel, threshold: 0 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

If the judge marks the answer as contradicting the one context passage, the score is `1` and this example fails. A fully aligned answer scores `0` and passes. **Lower is better.**

## What it needs

Requires a completion `model` and nonempty `case.context` or `context`. **Lower is better:** the fraction of context items judged contradictory. It is a contradiction check, not a complete unsupported-claim check.

The default threshold is `0.5`; this example sets one explicitly. A score at or below the threshold passes. `strictMode: true` requires a score of zero. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

The score is the fraction of context passages judged contradictory, not the fraction of unsupported answer claims. Supply a nonempty `case.context` array or the metric’s `context` option. Use `faithfulness` to check claim support against retrieved evidence.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[faithfulness](/lens/evaluations/metrics/faithfulness), [abstention](/lens/evaluations/metrics/abstention).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
