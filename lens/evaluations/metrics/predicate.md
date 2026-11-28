# `predicate`

`predicate(name, check)` turns an application-owned rule into a metric without writing a custom metric type. Reach for it when the rule is a few lines of code you want to keep next to the suite.

```ts
import { predicate } from '@anvia/core/evals'

const mentionsWindow = predicate<string, string>('mentions_window', ({ output }) => ({
  pass: output.includes('30 days'),
  comment: 'The answer must state the refund window.',
}))
```

`output` is the raw value the target returned, not text. With a function target that returns a string, read it directly. With `agentEvalTarget(agent)` the output is an `AgentResponse`, so read the reply from `output.output`; `String(output)` would give `"[object Object]"`:

```ts
import type { AgentResponse } from '@anvia/core'
import { predicate } from '@anvia/core/evals'

const startsCorrectly = predicate<string, AgentResponse<string>>('starts_with_refund', ({ output }) => {
  return { pass: output.output.startsWith('Refunds'), comment: 'Answer must open with "Refunds".' }
})
```

The check returns a boolean or `{ pass, comment }`. A boolean uses the option `comment` for the failure message; the returned comment wins when both exist.

## Arguments and options

`predicate(name, check, options?)` takes the metric name as its first argument. That name is what `scores` and `metricSummaries` key on. The optional third argument accepts:

| Option | Default | Effect |
| --- | --- | --- |
| `required` | `true` | Whether a failure gates the case. |
| `comment` | none | Failure text when the check returns a boolean. |
| `metadata` | none | Attached to the metric definition, not the outcome. Reporters that export metric metadata, such as the OTel and Lens reporters (`anvia.eval.metric.metadata`) and the Langfuse reporter, include it. |

A thrown error inside the check makes the judgment invalid rather than failed, which distinguishes "the rule could not run" from "the rule rejected the output".

`predicate` returns a `BOOLEAN` metric with `higher_is_better` and a threshold of `1`, so it aggregates into `metricSummaries` like the built-in boolean metrics.

## When not to use it

A predicate is application code inside a metric: it is not versioned with the framework, it cannot be reused across repositories through the package, and it does not carry the documentation of a built-in. Prefer `contains`, `requiredFields`, `schemaMatch`, or an agent metric when one fits. Prefer [`createEvalTypes`](/sdk/evaluations#evaluate-an-agent) with `EvalOutcome` when the rule needs configuration, its own data type, or a reusable projection.

Keep predicates pure and deterministic. A predicate that calls a model belongs in [a judge metric](/lens/evaluations/metrics/llm-judge), where usage and cost are tracked.
