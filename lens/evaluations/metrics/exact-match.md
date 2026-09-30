# exactMatch

Checks whether the output equals the expected value.

## When to use

The output must equal a known value, such as a status, ID, or fixed structured result.

## Why use it

It gives an unambiguous comparison, including structural equality for objects and arrays.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { exactMatch, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'exact-match-example',
  cases: [
    {
      id: 'status',
      input: 'What is the order status?',
      expected: 'shipped',
    },
  ],
  target: async () => 'shipped',
  metrics: [
    exactMatch(),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An output of `processing` fails with score `false`.

## What it needs

Any output and an `expected` value; passes when they are equal.

## Keep in mind

Strings must match exactly, including case and whitespace. Objects and arrays are compared structurally; array order matters. Normalize the value with `actual` if your contract allows differences such as surrounding whitespace.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[contains](/lens/evaluations/metrics/contains), [semanticSimilarity](/lens/evaluations/metrics/semantic-similarity).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
