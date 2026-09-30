# promptAlignment

Checks whether an answer follows the instructions you specify.

## When to use

The answer must follow named instructions, such as tone or output rules.

## Why use it

It reports compliance across each instruction.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { promptAlignment, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'prompt-alignment-example',
  cases: [
    {
      id: 'answer-format',
      input: 'Explain the refund policy.',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    promptAlignment({
      model: judgeModel,
      promptInstructions: ['Reply in English.', 'Keep the answer to one sentence.'],
      threshold: 1,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

Each instruction receives a yes/no verdict. Following both instructions scores `1`; following only one scores `0.5` and fails this example’s threshold.

## What it needs

Requires a completion `model` and nonempty `promptInstructions`. Higher is better: the fraction of instructions judged followed.

The default threshold is `0.5`; this example sets one explicitly. A score at or above the threshold passes. `strictMode: true` requires a score of 1. `includeReason` defaults to `true` so the outcome includes a final explanation.

## Keep in mind

Supply at least one instruction. The metric evaluates the listed `promptInstructions`; it does not automatically read your agent’s system instructions. For a hard character limit or fixed output pattern, a direct check is simpler.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[maxLength](/lens/evaluations/metrics/max-length), [matches](/lens/evaluations/metrics/matches), [answerRelevancy](/lens/evaluations/metrics/answer-relevancy).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
