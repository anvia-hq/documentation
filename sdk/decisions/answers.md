# Answers and results

`decide()` resolves to a `DecisionResult` with three fields.

```ts
type DecisionResult<Questions, RawResponse> = {
  readonly answers: DecisionAnswers<Questions>
  readonly usage?: Usage | undefined
  readonly rawResponse: RawResponse
}
```

## 1. Typed answers

`answers` has one entry per question name, and each entry's type is derived from its question.

```ts
const result = await decide({ model, state, questions })

result.answers.department.choice // 'billing' | 'technical' | 'general'
result.answers.topics.labels // readonly ('subscription' | 'duplicateCharge' | 'refund')[]
result.answers.urgency.score // number on the 0 to 3 rubric
result.answers.cancellation.probability // number from 0 to 1
```

Each answer has a `type` discriminator matching its question (`'choice'`, `'multi-label'`, `'score'`, or `'check'`).

| Answer | Fields |
| --- | --- |
| `ChoiceAnswer` | `choice`, optional `probabilities` keyed by option, optional `confidence` |
| `MultiLabelAnswer` | `labels` (selected), `probabilities` keyed by option |
| `ScoreAnswer` | `score`, `rubric`, optional `probabilities` in rubric order, optional `confidence` |
| `CheckAnswer` | `probability` |

## 2. Probabilities and confidence

- Choice and score `probabilities` are exclusive distributions that sum to one, allowing for ordinary rounding.
- Multi-label probabilities are independent and do not need to sum to one.
- `confidence` is reported by the provider. It is not derived from the highest probability.
- Anvia does not calibrate these values. Treat them as estimates and set your own action thresholds, ideally from labeled examples.
- Relevance scores from native rerankers have different semantics and are not converted into probabilities by this contract.

## 3. Usage

`result.usage` is normalized Anvia token usage when the provider reports it, and is omitted otherwise. When present it passes the same non-negative-number validation as other usage.

## 4. Raw response

`result.rawResponse` is the original provider result. Its type flows from the model, so a model typed `DecisionModel<MyRaw>` returns `MyRaw`. Use it for diagnostics and provider-native fields. Do not return it to end users, and apply the same retention policy as other provider payloads.

## 5. Validation guarantee

Before `decide()` returns, core checks that:

- the answers have exactly the requested question names and matching types;
- a choice is one of the declared options and its probabilities cover exactly those options;
- multi-label probabilities cover exactly the options, `labels` are unique, and they match the threshold rule;
- a score is within the rubric bounds, the returned rubric equals the one you sent, and any distribution matches the rubric length;
- a check probability and any confidence are between zero and one;
- usage values are non-negative finite numbers.

A violation throws [`DecisionProviderOutputError`](/sdk/decisions/errors), so downstream branching can trust the shapes.
