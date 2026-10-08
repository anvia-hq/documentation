# Decisions

Create a decision model from the client, then pass it to `decide()` or `decideBatch()` from `@anvia/core/decision`.

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'
import { check, choice, decide, multiLabel, score } from '@anvia/core/decision'

const model = new JevClient({ apiKey: process.env.TYPESAFE_API_KEY })
  .decisionModel({ modelId: JEV_LATEST })

const result = await decide({
  model,
  state: { title: 'Wireless headphones with noise cancellation' },
  questions: {
    category: choice({
      instructions: 'Choose the product category.',
      options: { audio: 'Audio equipment', clothing: 'Clothes', other: 'Other products' },
    }),
    features: multiLabel({
      instructions: 'Which features are mentioned?',
      options: { wireless: 'Wireless connectivity', anc: 'Noise cancellation' },
    }),
    quality: score({
      instructions: 'How complete is this listing?',
      rubric: ['Poor', 'Adequate', 'Good'],
    }),
    giftable: check({ instructions: 'Would this make a good gift?' }),
  },
  retries: { maxAttempts: 2 },
})

console.log(result.answers.category.choice)
```

## Mapping to Jev

| Anvia question | Jev request | Mapping |
| --- | --- | --- |
| `choice` | `Choice` | Options become criteria. Choice, probabilities, and confidence are preserved. |
| `multiLabel` | One `Noul` per label | Independent label checks share the request. The inclusive threshold selects labels. |
| `score` | `Score` | The rubric becomes criteria. Numbered probabilities become an array in rubric order. |
| `check` | `Noul` | `noul` becomes `probability`. |

All questions in a call share a single SDK request, so mixed question types work. Each additional multi-label option becomes another Noul question and may increase billed usage. The adapter generates its own wire IDs so application question names never collide, and the returned answers use your original names.

## Limits

Choice supports at most 255 options and score at most 10 levels. These are declared on the model and `decide()` rejects larger questions with a `RangeError` before any network work. Limits Jev does not document, such as questions per request or multi-label options, are not declared.

## State and criteria encoding

The SDK's entry type accepts strings, objects, arrays, and null. Numeric and boolean state or criteria are therefore wrapped as `{ value }` on the wire. Your answers still carry the original rubric values.

## Score legend validation

Jev responses for a score must include a legend whose numbered levels and descriptions exactly match the rubric sent. A missing or mismatched legend throws `DecisionProviderOutputError`. Object property order does not affect matching; array order does.

## Usage and raw response

`result.usage` maps Jev input and output token counts to Anvia usage, with the total computed from the two. Missing or invalid usage from Jev throws `DecisionProviderOutputError`. `result.rawResponse` is the original SDK result, including native answer fields and generated question IDs.

## Provider options

```ts
await decide({ model, state, questions, providerOptions: { /* extra JSON body fields */ } })
```

`providerOptions` forwards extra JSON fields in the request body. The adapter preserves `model`, `state`, and `questions`, so options cannot replace them.

## Cancellation and timeouts

Pass `abortSignal` to cancel. Caller cancellation surfaces as an `AbortError`. An SDK timeout is normalized to an error named `TimeoutError` that the default retry policy treats as transient, while a caller abort is never retried.

For batches, see [Batches](/sdk/decisions/batches).
