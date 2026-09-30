# containsAny

Checks whether at least one accepted phrase or pattern appears in the answer.

## When to use

Several wordings or phrases are acceptable.

## Why use it

It avoids rejecting valid alternatives.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { containsAny, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'contains-any-example',
  cases: [
    {
      id: 'billing-role',
      input: 'Who can change billing settings?',
    },
  ],
  target: async () => 'Workspace owners can change billing settings.',
  metrics: [
    containsAny({ expected: ['Workspace owners', 'Account administrators'] }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true` because one accepted phrase is present. An answer that matches none of the options fails.

## What it needs

Output text and a nonempty array of strings or regular expressions; passes when at least one item is found.

## Keep in mind

Use a nonempty array of accepted alternatives. This metric requires only one match. Choose `containsAll` when every item must appear.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[containsAll](/lens/evaluations/metrics/contains-all), [semanticSimilarity](/lens/evaluations/metrics/semantic-similarity).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
