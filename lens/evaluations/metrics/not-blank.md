# `notBlank`

`notBlank()` fails an empty or whitespace-only answer. It is the cheapest guard against a target that returns nothing, so pair it with any metric that could pass on the absence of content.

```ts
import { notBlank } from '@anvia/core/evals'

const metric = notBlank()
```

No expectation is required and `case.expected` is not read. The metric trims the output text and passes when at least one non-whitespace character remains.

| Option | Default | Effect |
| --- | --- | --- |
| `name` | `not_blank` | Metric name in `scores` and `metricSummaries`. |
| `required` | `true` | Whether a blank answer gates the case. |
| `actual` | the case output | Selector for the value to test. |

## Why it is separate from `requiredFields`

`requiredFields` inspects object keys; `notBlank` inspects text. An answer of `"   "` or `""` satisfies a schema that only checks for a string, so a suite that relies on `schemaMatch` alone can pass an empty payload. Add `notBlank()` when empty output is a failure rather than a valid answer.

The metric serializes non-string output the same way the text metrics do, so neither `{}` nor `null` is blank: they serialize to `"{}"` and `"null"`. Only an empty or whitespace-only string fails. When a `null` output should fail, check it with a [`predicate`](/lens/evaluations/metrics/predicate) or [`schemaMatch`](/lens/evaluations/metrics/schema-match).

A blank answer usually means the target failed silently. If you would rather record that as a failure of the target than of the requirement, assert it with `maxLength` or a predicate instead; `invalid` outcomes do not gate an application quality gate the same way a required failure does.
