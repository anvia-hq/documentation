# Questions

A question describes one judgment. Four helpers create them: `choice`, `multiLabel`, `score`, and `check`. Each helper validates its input immediately and returns a plain data object tagged with its `type`.

```ts
import { check, choice, multiLabel, score } from '@anvia/core/decision'
```

| Helper | Answer | Semantics |
| --- | --- | --- |
| `choice({ instructions, options })` | `choice`, optional `probabilities` and `confidence` | Exactly one option is selected. Probabilities are exclusive and sum to one. |
| `multiLabel({ instructions, options, threshold? })` | `labels`, `probabilities` | Each label has an independent probability. Labels at or above the threshold are selected. |
| `score({ instructions, rubric })` | `score`, `rubric`, optional `probabilities` and `confidence` | A position on an ordered, zero-indexed rubric. |
| `check({ instructions })` | `probability` | The estimated probability of yes. Your code chooses the action threshold. |

Every question requires non-empty `instructions`.

## 1. Choice

```ts
const department = choice({
  instructions: 'Which department should handle this?',
  options: {
    billing: 'Payments, invoices, and refunds',
    technical: 'Product bugs and technical problems',
    general: 'Other requests',
  },
})
```

Option keys are the labels. Option values describe each label to the model and may be any JSON value, including structured criteria or `null` for an undescribed label. Keys must be non-empty and at least one option is required. Because the options are captured as literals, the answer's `choice` is typed as the union of the keys.

## 2. Multiple labels

```ts
const topics = multiLabel({
  instructions: 'Select all topics present in the message.',
  options: {
    subscription: 'Subscriptions and renewals',
    duplicateCharge: 'Multiple charges for the same purchase',
    refund: 'Requests to return a payment',
  },
  threshold: 0.7,
})
```

Labels are judged independently, so none, one, or several can be selected. `threshold` is inclusive and must be between zero and one; it defaults to `0.5`. Probabilities do not need to sum to one.

Providers may compose this from several native questions. With [Jev](/sdk/providers/jev/decisions), each label becomes its own question in the same request, which can increase billed usage.

## 3. Score

```ts
const urgency = score({
  instructions: 'How urgently does this need attention?',
  rubric: ['Low', 'Normal', 'High', 'Critical'],
})
```

The rubric is an ordered list of at least two JSON levels. The returned `score` is a position on the zero-indexed rubric and can be fractional, so `1.6` sits between `Normal` and `High`. The answer repeats the rubric you sent, preserving its literal types. To prioritize items, score them on the same rubric and sort or combine dimensions in application code.

## 4. Check

```ts
const cancellation = check({
  instructions: 'Is the customer asking to cancel their subscription?',
})
```

A check returns a probability between zero and one. Anvia does not pick a threshold for you: decide in application code what probability should trigger an action.

## 5. Combine questions

```ts
const questions = { department, topics, urgency, cancellation }
```

Question names identify the answers. A single request may mix question types when the model declares `mixedQuestions`. Define question objects once and reuse them across inputs; they are plain data.

## 6. State

`state` accepts any JSON-compatible value: a string, number, boolean, `null`, array, or object. Anything else, such as a `Date`, class instance, or `undefined` field, is rejected before the call.

## Validation rules

| Rule | Error |
| --- | --- |
| Questions must be plain data objects with non-empty `instructions` | `TypeError` |
| `choice` and `multiLabel` need at least one option; keys cannot be blank; values must be JSON | `TypeError` |
| `score` needs a rubric of at least two JSON levels | `TypeError` |
| `multiLabel` `threshold` must be between zero and one | `RangeError` |
| `questions` must be a non-empty plain object with non-empty names | `TypeError` |

Next, read [Answers and results](/sdk/decisions/answers).
