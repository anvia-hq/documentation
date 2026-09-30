# answerRelevancy

Checks whether an answer stays relevant to the user’s question.

## When to use

Check whether an answer addresses the user's input.

## Why use it

It finds off-topic statements without requiring one reference answer.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { answerRelevancy, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'answer-relevancy-example',
  cases: [
    {
      id: 'refund-question',
      input: 'How long are refunds available?',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    answerRelevancy({ model: judgeModel, threshold: 0.8 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The judge splits the answer into statements and marks their relevance. The score is the fraction not marked irrelevant. For example, four relevant statements and one irrelevant statement produce `0.8`.

## What it needs

Requires a completion `model`; compares answer statements with the case input. Higher is better. If the judge extracts no statements, the score is 1, so pair it with a nonempty-output check.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Indeterminate relevance counts toward the score. If the judge extracts no statements, the score is 1. Add a nonempty-output check and a correctness or grounding metric when those properties matter.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[faithfulness](/lens/evaluations/metrics/faithfulness), [promptAlignment](/lens/evaluations/metrics/prompt-alignment), [turnRelevancy](/lens/evaluations/metrics/turn-relevancy).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
