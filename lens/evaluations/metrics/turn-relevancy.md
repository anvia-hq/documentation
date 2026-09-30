# turnRelevancy

Checks whether assistant replies stay relevant across a conversation.

## When to use

A multi-turn assistant may stop answering the current conversation.

## Why use it

It checks each assistant reply against its preceding conversation window.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { turnRelevancy, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'turn-relevancy-example',
  cases: [
    {
      id: 'refund-follow-up',
      input: 'Evaluate this support conversation.',
    },
  ],
  target: async () => [
    { role: 'user', content: 'How long are refunds available?' },
    { role: 'assistant', content: 'Refunds are available for 30 days.' },
    { role: 'user', content: 'Do I need a receipt?' },
    { role: 'assistant', content: 'Our office has blue walls.' },
  ],
  metrics: [
    turnRelevancy({ model: judgeModel, windowSize: 10, threshold: 1 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

If the first reply is judged relevant and the second irrelevant, the score is `0.5`. That fails this example’s threshold of `1`.

## What it needs

Requires a completion `model` and conversation turns, either selected with `turns` or present in the output. Higher is better: the fraction of interactions judged relevant. `windowSize` controls how many interactions each check sees.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Provide a nonempty array of user/assistant turns, messages, or an output object with `messages`. Use the `turns` selector for another output shape. `windowSize` counts interactions and defaults to 10. With no completed user/assistant interaction, the metric scores 1; use cases that actually contain replies to judge.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[answerRelevancy](/lens/evaluations/metrics/answer-relevancy), [knowledgeRetention](/lens/evaluations/metrics/knowledge-retention).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
