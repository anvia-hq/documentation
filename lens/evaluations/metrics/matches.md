# matches

Checks whether output text matches a regular expression.

## When to use

The output must follow a text pattern, such as an order ID format.

## Why use it

A regular expression checks format without requiring one exact value.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { matches, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'matches-example',
  cases: [
    {
      id: 'order-id-format',
      input: 'Return the order ID only.',
    },
  ],
  target: async () => 'ORD-123456',
  metrics: [
    matches({ expected: /^ORD-\d{6}$/ }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. `Order ID: ORD-123456` fails because the pattern requires the entire output to be the ID.

## What it needs

Output text and an `expected` regular expression; passes when it matches anywhere in the text. Anchor the pattern to require a full-string match.

## Keep in mind

Use `^` and `$` to anchor a pattern to the beginning and end of the answer. Without anchors, a match anywhere in the answer is enough. The metric resets the regular expression’s `lastIndex` before and after checking.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[exactMatch](/lens/evaluations/metrics/exact-match), [doesNotMatch](/lens/evaluations/metrics/does-not-match).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
