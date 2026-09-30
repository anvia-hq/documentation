# llmJudge

Uses a model to produce a structured judgment and applies your pass/fail rule.

## When to use

You need a custom pass/fail rule or a structured verdict.

## Why use it

You control the judge instructions, Zod `schema`, and `passes` predicate.

## Example

Use your configured [completion model](/sdk/models/completion) as `judgeModel`. The judge makes model calls and its verdict can vary.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { llmJudge, runEvalSuite } from '@anvia/core/evals'
import { z } from 'zod'

const result = await runEvalSuite({
  name: 'llm-judge-example',
  cases: [
    {
      id: 'refund-policy',
      input: 'How long are refunds available?',
      expected: '30 days, with no invented exceptions.',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    llmJudge({
      model: judgeModel,
      schema: z.object({ passed: z.boolean(), reason: z.string() }),
      instructions: 'Pass only if the answer states a 30-day refund window and invents no exceptions.',
      passes: (judgment) => judgment.passed,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The score is the structured object returned by the judge, such as `{ passed: true, reason: "The answer states the required window." }`. Your `passes` function decides the outcome.

## What it needs

Requires a completion `model`, `schema`, and `passes`. Returns the schema output as its score; `passes` decides the outcome. Supply a focused `prompt` when the default case/output prompt is insufficient.

## Keep in mind

The default judge prompt includes the suite name, case ID, input, expected value, and target output. Add context or retrieval evidence through a custom `prompt` when the judge needs it. Use `prompt` to select different evidence. The schema’s reason is part of the score object; copy or inspect it there. A model judgment can vary, so test the rule with answers that must fail.

Use the optional `prompt` selector when the judge needs evidence beyond the default case input, expected value, and output.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[llmScore](/lens/evaluations/metrics/llm-score), [gEval](/lens/evaluations/metrics/g-eval).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
