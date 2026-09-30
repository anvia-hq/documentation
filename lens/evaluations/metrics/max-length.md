# maxLength

Checks whether output text stays within a character limit.

## When to use

An answer has a hard length limit.

## Why use it

It checks a clear output constraint without model judgment.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { maxLength, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'max-length-example',
  cases: [
    {
      id: 'short-answer',
      input: 'Explain the refund policy briefly.',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    maxLength({ max: 80 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An answer longer than 80 Unicode code points fails and reports the actual length.

## What it needs

Output text and a required nonnegative integer `max`; passes when the text has at most that many Unicode code points.

## Keep in mind

The count uses Unicode code points, not bytes, tokens, or visible grapheme clusters. Some emoji contain several code points. Choose this metric when that counting rule matches your output limit.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[promptAlignment](/lens/evaluations/metrics/prompt-alignment), [contains](/lens/evaluations/metrics/contains).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
