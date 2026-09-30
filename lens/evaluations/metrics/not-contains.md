# notContains

Checks whether the answer avoids a forbidden phrase or pattern.

## When to use

A response must avoid a known wrong or prohibited phrase.

## Why use it

It catches a specific regression without judging the entire answer.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { notContains, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'not-contains-example',
  cases: [
    {
      id: 'wrong-window',
      input: 'How long are refunds available?',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    notContains({ expected: '90 days' }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An answer containing `90 days` fails with score `false`.

## What it needs

Output text and a string or regular expression; passes when absent.

## Keep in mind

String matching is case sensitive. This check only looks for the forbidden text; an empty answer can pass. Pair it with a required-content or nonempty-output check.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[doesNotMatch](/lens/evaluations/metrics/does-not-match), [contains](/lens/evaluations/metrics/contains).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
