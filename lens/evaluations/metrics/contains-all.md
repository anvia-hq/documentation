# containsAll

Checks whether every required phrase or pattern appears in the answer.

## When to use

Several independent facts must all appear.

## Why use it

It shows when any required part is missing.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { containsAll, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'contains-all-example',
  cases: [
    {
      id: 'refund-requirements',
      input: 'What do I need for a refund?',
    },
  ],
  target: async () => 'Request a refund within 30 days and include your receipt.',
  metrics: [
    containsAll({ expected: ['30 days', 'receipt'] }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An answer mentioning `30 days` but omitting `receipt` fails; its comment lists missing items.

## What it needs

Output text and a nonempty array of strings or regular expressions; passes when every item is found.

## Keep in mind

Provide a nonempty array of strings or regular expressions. Each item is a separate text check. It does not verify that the phrases are used correctly in context.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[contains](/lens/evaluations/metrics/contains), [containsAny](/lens/evaluations/metrics/contains-any), [promptAlignment](/lens/evaluations/metrics/prompt-alignment).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
