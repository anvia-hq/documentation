# `schemaMatch`

`schemaMatch(schema)` validates the output against a Zod schema and reports a boolean judgment. Use it for a contract you already own; use [`jsonCorrectness`](/lens/evaluations/metrics/json-correctness) when the question is whether the text is valid JSON at all.

```ts
import { schemaMatch } from '@anvia/core/evals'
import { z } from 'zod'

const metric = schemaMatch(z.object({ status: z.string(), count: z.number() }), {
  parseJson: true,
})
```

| Option | Default | Effect |
| --- | --- | --- |
| `schema` | required | Zod schema the value must satisfy. |
| `parseJson` | `false` | Parse string output as JSON before validating. |
| `name` | `schema_match` | Metric name in `scores` and `metricSummaries`. |
| `required` | `true` | Whether a mismatch gates the case. |
| `actual` | the case output | Selector for the value to validate. |

With `parseJson: false` the output itself is validated, which is what you want when the target already returns an object. With `parseJson: true` a string is parsed first.

Both a JSON parse error and a schema violation are recorded as a **failure**, not an invalid judgment, with the prettified Zod error as the comment. That is deliberate: the output was judged and it did not meet the contract. The value is passed to `safeParse` as is, without serializing, so any output can be judged. The outcome is invalid only when evaluation throws, for example when a custom `actual` selector throws.

## Relationship to structured output

`schemaMatch` evaluates a target; it does not enforce one. If you need the agent itself to produce conforming output in production, configure `outputSchema` on the agent, which validates and repairs during the run. Use `schemaMatch` to prove the production path still satisfies the same schema, and keep both schemas in one module so they cannot drift.

A schema that accepts anything is not a test. Require the fields the application actually reads, and check optionality deliberately: `z.object({ status: z.string() })` passes `{ status: "unknown" }`, so pair the schema with [`containsAny`](/lens/evaluations/metrics/contains-any) or a [`predicate`](/lens/evaluations/metrics/predicate) when the values matter too.
