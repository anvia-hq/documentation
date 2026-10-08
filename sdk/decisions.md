# Typed decisions

Typed decisions ask a model a bounded question about some data and return a typed answer instead of free text. Use them for classification, routing, tagging, prioritization, record matching, and verification, where the application needs a label, a score, or a probability it can branch on.

```text
state (JSON)          questions                  decide()                answers
ticket text    +      department: choice   ->    validate request   ->   department.choice
record fields         topics: multiLabel         call model              topics.labels
                      urgency: score             validate answers        urgency.score
                      refund: check              retry / cancel          refund.probability
```

Decisions live in `@anvia/core/decision` and are also exported from the root `@anvia/core`. They do not require an agent: an application calls `decide()` directly, and the same call works inside a pipeline step, an agent hook, a tool, or an eval metric.

## 1. Install a decision provider

Core defines the contract; a provider package supplies a decision model. [`@anvia/jev`](/sdk/providers/jev) is the first adapter.

```sh
pnpm add @anvia/core @anvia/jev
```

## 2. Ask a question

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'
import { choice, decide } from '@anvia/core/decision'

const jev = new JevClient({ apiKey: process.env.TYPESAFE_API_KEY })
const model = jev.decisionModel({ modelId: JEV_LATEST })

const { answers } = await decide({
  model,
  state: { message: 'Please refund my duplicate payment.' },
  questions: {
    department: choice({
      instructions: 'Which department should handle this?',
      options: {
        billing: 'Payments, invoices, and refunds',
        technical: 'Product bugs and technical support',
        general: 'Other requests',
      },
    }),
  },
})

console.log(answers.department.choice) // 'billing' | 'technical' | 'general'
console.log(answers.department.confidence)
```

`state` is the data being judged. `questions` is an object whose keys name the answers. The result's `answers` has the same keys, and each answer type follows its question: the `choice` above is typed as the union of the option keys.

## 3. What `decide()` adds

A decision model performs one provider call. `decide()` wraps it with the application-facing guarantees:

- It validates the request before network work: JSON-compatible state, plain-data questions, non-empty names, and the model's declared capabilities and limits.
- It validates the answers after the call, so a malformed provider response throws instead of reaching your branching logic.
- It applies the shared [retry policy](/sdk/decisions/execution) and honors an `AbortSignal`.

`decideBatch()` runs many independent inputs with bounded concurrency and returns ordered per-item results. See [Batches](/sdk/decisions/batches).

## 4. Continue through the section

- [Questions](/sdk/decisions/questions): `choice`, `multiLabel`, `score`, and `check`.
- [Answers and results](/sdk/decisions/answers): answer shapes, probabilities, confidence, usage, and raw responses.
- [Execution](/sdk/decisions/execution): retries, cancellation, and provider options.
- [Batches](/sdk/decisions/batches): ordered, concurrent, failure-isolated runs.
- [Custom decision models](/sdk/decisions/custom-models): implement the `DecisionModel` contract.
- [Errors and validation](/sdk/decisions/errors): what throws and when.
- [Production checklist](/sdk/decisions/production).

## Choose the right primitive

| Need | Use |
| --- | --- |
| A label, score, or probability from a fixed set of possibilities | Typed decisions |
| Free-form fields extracted from text under a schema | [Structured output](/sdk/structured-output) |
| A multi-step, tool-using loop | [Agents](/sdk/agents) |
| Fixed multi-stage workflow around decisions | [Pipelines](/sdk/pipelines) |

Decisions answer closed questions. Probabilities and confidence are provider-reported estimates; Anvia does not calibrate them.
