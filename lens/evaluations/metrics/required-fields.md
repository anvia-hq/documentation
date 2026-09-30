# requiredFields

Checks whether an object contains all required top-level fields.

## When to use

A target returns an object with mandatory top-level keys.

## Why use it

It quickly detects missing keys.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { requiredFields, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'required-fields-example',
  cases: [
    {
      id: 'ticket-shape',
      input: 'Create an escalation record.',
    },
  ],
  target: async () => ({ ticketId: 'T-123', priority: 'high' }),
  metrics: [
    requiredFields({ expected: ['ticketId', 'priority'] }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example passes with score `true`. An object missing `priority` fails. A non-object output is invalid.

## What it needs

An object and a required nonempty `expected` array of field names; passes when all are own properties. It does not validate field values or nested structure.

## Keep in mind

Field presence is enough: a field with value `null` or `undefined` still exists. This metric does not check value types, allowed values, or nested paths. Use `jsonCorrectness` for JSON text that must satisfy a schema.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[jsonCorrectness](/lens/evaluations/metrics/json-correctness), [exactMatch](/lens/evaluations/metrics/exact-match).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
