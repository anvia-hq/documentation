# Batches

`decideBatch()` runs one model over many independent inputs with bounded concurrency. Results come back in input order, and one failure does not stop the others.

```ts
import { choice, decideBatch } from '@anvia/core/decision'

const questions = {
  department: choice({
    instructions: 'Which department?',
    options: { billing: 'Payments', technical: 'Bugs', general: 'Other' },
  }),
}

const { items } = await decideBatch({
  model,
  inputs: ['Refund my payment', 'The app crashes'].map((message) => ({
    state: { message },
    questions,
  })),
  concurrency: 4,
})

for (const item of items) {
  if (item.status === 'completed') console.log(item.index, item.result.answers)
  else console.error(item.index, item.error)
}
```

## 1. Options

| Option | Meaning |
| --- | --- |
| `model` | One decision model shared by every input. |
| `inputs` | A finite iterable of `{ state, questions, providerOptions? }`. |
| `concurrency` | Required positive safe integer: the maximum number of calls in flight. |
| `retries` | The same retry setting as `decide()`, applied per item. |
| `abortSignal` | Cancels the batch. |

The iterable is buffered before work starts, so pass a finite collection. An invalid `concurrency` throws a `RangeError`.

## 2. Item results

Each entry in `items` has an `index` and a `status`:

- `{ index, status: 'completed', result }` with a validated `DecisionResult`.
- `{ index, status: 'failed', error }` with the thrown error, such as a capability, validation, or provider failure.

Every item goes through `decide()`, so each is validated and retried independently. Items are ordered by `index` even if they finish out of order. Different inputs may use different questions, but sharing one `questions` object keeps the answers uniformly typed.

## 3. Cancellation

Cancelling stops scheduling further items and rejects the whole batch with an `AbortError`. Partial results are not returned, so persist progress yourself if cancelled work matters.

## 4. When not to use it

`decideBatch()` runs in the current process. It does not persist progress or survive a restart, and it does not use a provider bulk API. For large or restart-sensitive jobs, feed items through a durable queue and call `decide()` in each worker. See [parallel and batch execution](/sdk/advanced/parallel-and-batch) for the same trade-offs in pipelines.

Choose `concurrency` from the provider's rate limits and your own latency budget, not from the input count.
