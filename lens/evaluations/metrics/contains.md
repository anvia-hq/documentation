# contains

Checks whether the answer includes a required phrase or pattern.

## When to use

A response must mention one required fact or phrase.

## Why use it

It allows surrounding explanation while checking the essential text.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { contains, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'contains-example',
  cases: [
    {
      id: 'refund-window',
      input: 'How long are refunds available?',
      expected: '30 days',
    },
  ],
  target: async () => 'Refunds are available for 30 days after purchase.',
  metrics: [
    contains(),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true` because the answer includes `30 days`. An answer that says only `Refunds are available` fails.

## What it needs

Output text and a string or regular expression; passes when found. String matching is case sensitive.

## Keep in mind

String matching is case sensitive. A phrase appearing in a denial still counts as present: `Refunds are not available for 30 days` would also pass this check. Use a judge or grounding metric when the meaning of the sentence matters.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[containsAll](/lens/evaluations/metrics/contains-all), [containsAny](/lens/evaluations/metrics/contains-any), [faithfulness](/lens/evaluations/metrics/faithfulness).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
