# jsonCorrectness

Checks whether output text is valid JSON and satisfies a Zod schema.

## When to use

The answer must be valid JSON matching a known schema.

## Why use it

Parsing and Zod validation catch syntax, missing fields, and wrong types directly.

## Example

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { jsonCorrectness, runEvalSuite } from '@anvia/core/evals'
import { z } from 'zod'

const result = await runEvalSuite({
  name: 'json-correctness-example',
  cases: [
    {
      id: 'ticket-json',
      input: 'Return an escalation record as JSON.',
    },
  ],
  target: async () => '{"ticketId":"T-123","priority":"high"}',
  metrics: [
    jsonCorrectness({
      schema: z.object({ ticketId: z.string(), priority: z.enum(['low', 'high']) }),
    }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

This example scores `1` and passes. Malformed JSON, a missing `ticketId`, or `priority: "urgent"` scores `0` and fails.

## What it needs

Requires a Zod `schema`; scores 1 for valid JSON matching the schema, otherwise 0. A completion `model` is optional and is used only to explain a failure.

## Keep in mind

Pass JSON text rather than Markdown code fences. Syntax and schema validation run locally. A supplied completion `model` is used only to explain invalid JSON or schema failures when `includeReason` is enabled. Strict mode is enabled by default; the score remains binary.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[requiredFields](/lens/evaluations/metrics/required-fields), [exactMatch](/lens/evaluations/metrics/exact-match).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
