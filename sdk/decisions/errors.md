# Errors and validation

Failures fall into caller mistakes, unsupported requests, and bad provider output. Core reports each with a distinct error so you can handle them differently.

| Error | Thrown when |
| --- | --- |
| `TypeError` or `RangeError` | The request is invalid: non-JSON state, malformed questions, empty names, a threshold outside zero to one, a request over a declared limit, mixed questions on a model that does not support them, or an invalid `concurrency`. |
| `DecisionCapabilityError` | The model declares a question type `unsupported`. |
| `DecisionProviderOutputError` | The provider answered, but the answer violates the question contract or the usage is invalid. |
| `AbortError` | The `abortSignal` fired. |
| Provider error | The provider or network failed. Propagated as thrown, after any retries. |

## 1. Capability errors

```ts
import { DecisionCapabilityError } from '@anvia/core/decision'

try {
  await decide({ model, state, questions })
} catch (error) {
  if (error instanceof DecisionCapabilityError) {
    console.error(error.provider, error.modelId, error.questionType)
  }
}
```

The error carries `provider`, `modelId`, and `questionType`. It is thrown before any network request.

## 2. Provider output errors

```ts
import { DecisionProviderOutputError } from '@anvia/core/decision'

if (error instanceof DecisionProviderOutputError) {
  console.error(error.provider, error.modelId, error.questionName, error.cause)
}
```

The error carries `provider`, `modelId`, the offending `questionName` when known, and an optional `cause`. See [Answers and results](/sdk/decisions/answers#_5-validation-guarantee) for the checks. Log it with the request identifier but return a generic message to users, and consider routing the item to a person.

## 3. Batch failures

`decideBatch()` does not throw for per-item errors. They appear as `{ status: 'failed', error }`, so classify them with the same `instanceof` checks. Cancellation is the exception: it rejects the batch.

## 4. Provider errors

Everything else is surfaced unchanged, for example an authentication or rate-limit error from the vendor SDK. With [Jev](/sdk/providers/jev/production), an SDK timeout is normalized to an error named `TimeoutError` so the default retry policy treats it as transient.
