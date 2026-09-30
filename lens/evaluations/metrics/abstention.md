# abstention

Checks whether the assistant appropriately answers or declines to answer.

## When to use

Some cases should decline to answer while others should answer from evidence.

## Why use it

It catches both needless refusal and confident unsupported answers.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { abstention, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'abstention-example',
  cases: [
    {
      id: 'unknown-policy',
      input: 'Do refunds include a bonus credit?',
      retrievalContext: ['Refunds are available for 30 days.'],
    },
  ],
  target: async () => 'I do not have enough information to confirm whether a bonus credit is included.',
  metrics: [
    abstention({ model: judgeModel, shouldAbstain: true }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

A judge-recognized abstention produces `correct_abstention` and passes because `shouldAbstain` is true. A confident answer produces `unsupported_confident_answer` and fails.

| Result category | Outcome | Meaning |
| --- | --- | --- |
| `correct_abstention` | Pass | The assistant declined when it should. |
| `unnecessary_abstention` | Fail | The assistant declined an answerable case. |
| `unsupported_confident_answer` | Fail | The assistant answered when it should decline, or its answer lacked support. |
| `correct_grounded_answer` | Pass | The assistant gave a supported answer when it should. |

## What it needs

Requires a completion `model` and `shouldAbstain` boolean or selector. For answerable cases, provide nonempty `context` (or `case.retrievalContext`). Returns `correct_abstention`, `unnecessary_abstention`, `unsupported_confident_answer`, or `correct_grounded_answer`; the two `correct_*` categories pass.

## Keep in mind

Set `shouldAbstain` for each case, either as a boolean or a selector. When it is false, context must be nonempty and an answer must be grounded to pass. The metric’s `context` option defaults to `case.retrievalContext`.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[faithfulness](/lens/evaluations/metrics/faithfulness), [llmJudge](/lens/evaluations/metrics/llm-judge).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
