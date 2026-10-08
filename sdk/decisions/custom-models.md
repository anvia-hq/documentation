# Custom decision models

A decision model is any object implementing `DecisionModel<RawResponse>`. Implement it to add a provider, wrap an internal service, or write a deterministic test double.

```ts
interface DecisionModel<RawResponse = unknown> {
  readonly provider: string
  readonly modelId: string
  readonly capabilities: DecisionCapabilities
  decision<const Questions extends DecisionQuestions>(
    request: DecisionRequest<Questions>,
    options?: ModelCallOptions,
  ): Promise<DecisionResult<Questions, RawResponse>>
}
```

`DecisionRequest` contains `state`, `questions`, and optional `providerOptions`. `ModelCallOptions` carries `abortSignal` separately from the payload.

## 1. Declare capabilities

```ts
type DecisionCapabilities = {
  questionSupport: Record<'choice' | 'multi-label' | 'score' | 'check', 'native' | 'composed' | 'unsupported'>
  mixedQuestions: boolean
  limits?: {
    maxQuestionsPerRequest?: number
    maxChoiceOptions?: number
    maxMultiLabelOptions?: number
    maxRubricLevels?: number
  }
}
```

- `native` means the provider has a matching question type. `composed` means the adapter builds it from other primitives, as Jev does for `multi-label`. `unsupported` makes `decide()` throw `DecisionCapabilityError` before calling you.
- `mixedQuestions` declares whether different question types can share one request.
- Limits are checked before the call and throw `RangeError`. Omit any limit you do not know.

## 2. A complete offline model

This model needs no provider SDK. It selects the first option whose label appears in the state and returns a fixed probability for checks.

```ts anvia-check decision-custom-model
import {
  check, choice, decide, decideBatch,
  type DecisionAnswers, type DecisionCapabilities, type DecisionModel, type DecisionQuestions,
  type DecisionRequest, type DecisionResult,
} from '@anvia/core/decision'

const capabilities: DecisionCapabilities = {
  questionSupport: { choice: 'native', 'multi-label': 'unsupported', score: 'unsupported', check: 'native' },
  mixedQuestions: true,
  limits: { maxChoiceOptions: 20 },
}

const keywordModel: DecisionModel<{ text: string }> = {
  provider: 'demo',
  modelId: 'keywords',
  capabilities,
  async decision<const Questions extends DecisionQuestions>(
    request: DecisionRequest<Questions>,
    options?: { abortSignal?: AbortSignal | undefined },
  ): Promise<DecisionResult<Questions, { text: string }>> {
    options?.abortSignal?.throwIfAborted()
    const text = JSON.stringify(request.state).toLowerCase()
    const answers: Record<string, unknown> = {}
    for (const [name, question] of Object.entries(request.questions)) {
      if (question.type === 'choice') {
        const labels = Object.keys(question.options)
        const selected = labels.find((label) => text.includes(label)) ?? labels[0]!
        answers[name] = {
          type: 'choice',
          choice: selected,
          probabilities: Object.fromEntries(labels.map((label) => [label, label === selected ? 1 : 0])),
        }
      } else if (question.type === 'check') {
        answers[name] = { type: 'check', probability: text.includes('refund') ? 0.9 : 0.1 }
      }
    }
    return { answers: answers as DecisionAnswers<Questions>, rawResponse: { text } }
  },
}

const questions = {
  department: choice({
    instructions: 'Which department should handle this?',
    options: { billing: 'Payments and refunds', technical: 'Bugs', general: 'Other' },
  }),
  refund: check({ instructions: 'Is a refund requested?' }),
}

const { answers } = await decide({
  model: keywordModel,
  state: { message: 'Please refund my billing error.' },
  questions,
})
console.log(answers.department.choice, answers.refund.probability)

const { items } = await decideBatch({
  model: keywordModel,
  inputs: ['billing issue', 'app crash'].map((message) => ({ state: { message }, questions })),
  concurrency: 2,
})
console.log(items.map((item) => item.status))
```

Because `decide()` validates the answers, an adapter bug such as a missing question, an option that was not requested, or probabilities that do not sum to one fails loudly in tests.

## 3. Adapter responsibilities

- Preserve the model, state, and question contract when applying `providerOptions`.
- Own composition: a provider without a native multi-label type can ask one yes/no question per label and assemble `labels` and `probabilities` itself.
- Pass `abortSignal` to the provider and translate provider timeouts so retries can tell a timeout from a caller cancellation.
- Report `usage` in Anvia's normalized shape, or omit it.
- Return the untouched provider result as `rawResponse`.

The low-level `model.decision()` performs one invocation with no retry or validation of its own. Application code should call `decide()`. For a production reference, see how [Jev](/sdk/providers/jev/decisions) maps each question type.
