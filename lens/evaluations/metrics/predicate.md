# `predicate`

`predicate(name, check)` turns an application-owned rule into a metric without writing a custom metric type. Reach for it when the rule is a few lines of code you want to keep next to the suite.

```ts
import { predicate } from '@anvia/core/evals'

const mentionsWindow = predicate('mentions_window', ({ output }) => ({
  pass: String(output).includes('30 days'),
  comment: 'The answer must state the refund window.',
}))
```

The check returns a boolean or `{ pass, comment }`. A boolean uses the option `comment` for the failure message; the returned comment wins when both exist.

```ts
const startsCorrectly = predicate('starts_with_refund', ({ output }) => {
  return { pass: String(output).startsWith('Refunds'), comment: 'Answer must open with "Refunds".' }
})
```

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `name` | required | Metric name; it must be the first argument and is what `scores` and `metricSummaries` key on. |
| `required` | `true` | Whether a failure gates the case. |
| `comment` | none | Failure text when the check returns a boolean. |
| `metadata` | none | Attached to the outcome for reporters. |

A thrown error inside the check makes the judgment invalid rather than failed, which distinguishes "the rule could not run" from "the rule rejected the output".

`predicate` returns a `BOOLEAN` metric with `higher_is_better` and a threshold of `1`, so it aggregates into `metricSummaries` like the built-in boolean metrics.

## When not to use it

A predicate is application code inside a metric: it is not versioned with the framework, it cannot be reused across repositories through the package, and it does not carry the documentation of a built-in. Prefer `contains`, `requiredFields`, `schemaMatch`, or an agent metric when one fits. Prefer [`createEvalTypes`](/sdk/evaluations#evaluate-an-agent) with `EvalOutcome` when the rule needs configuration, its own data type, or a reusable projection.

Keep predicates pure and deterministic. A predicate that calls a model belongs in [a judge metric](/lens/evaluations/metrics/llm-judge), where usage and cost are tracked.
