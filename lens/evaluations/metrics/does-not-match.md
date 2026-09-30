# doesNotMatch

Checks whether output text avoids a forbidden regular expression.

## When to use

The output must avoid a pattern, such as a secret-like token.

## Why use it

It catches variations that a forbidden literal phrase would miss.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { doesNotMatch, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'does-not-match-example',
  cases: [
    {
      id: 'no-key',
      input: 'Explain how authentication works.',
    },
  ],
  target: async () => 'Use your API key in the authorization header.',
  metrics: [
    doesNotMatch({ expected: /\bsk-[A-Za-z0-9]{20,}\b/ }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An answer containing a token matching the pattern fails.

## What it needs

Output text and an `expected` regular expression; passes when the pattern does not match.

## Keep in mind

The example pattern detects one token shape; it is not a complete secret detector. Choose patterns that match the specific output your application must prevent, and include examples that should fail.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[notContains](/lens/evaluations/metrics/not-contains), [matches](/lens/evaluations/metrics/matches).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
