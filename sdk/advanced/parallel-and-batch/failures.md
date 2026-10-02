# Failures and results

`runBatch()` returns a settled result for each input. Ordinary item failures do not stop scheduling later inputs or reject the batch promise.

## 1. Inspect per-item status

```ts anvia-check
import { Pipeline } from '@anvia/core/pipeline'
import { z } from 'zod'

const normalizeTicket = new Pipeline({
  id: 'normalize-ticket',
  inputSchema: z.string(),
}).step({
  id: 'normalize',
  run: ({ input }) => {
    const normalized = input.trim()
    if (!normalized) throw new Error('Ticket text is required.')
    return normalized
  },
})

const results = await normalizeTicket.runBatch({
  inputs: [' checkout failed ', '', ' password reset issue '],
  concurrency: 1,
})

for (const item of results) {
  if (item.status === 'completed') {
    console.log(item.runId, item.output)
  } else {
    // Map item.error before showing it to a user or storing it in public logs.
    console.log(item.runId, 'Ticket normalization failed.')
  }
}

const failed = results.filter((item) => item.status === 'failed')
console.log('Failed items:', failed.length)
```

The statuses are `completed`, `failed`, and `completed`, in input order. The third input runs even though the second fails. A completed item includes `output`; a failed item includes `error`.

If the pipeline itself returns a custom `{ ok, value }` outcome, that object is nested under a completed item's `output`. First narrow `item.status`, then inspect `item.output.ok`.

## 2. Require every result at the application boundary

When downstream work requires all items to succeed, check the results before publishing:

```ts
const failures = results.filter((item) => item.status === 'failed')
if (failures.length > 0) {
  throw new AggregateError(
    failures.map((item) => item.error),
    'Some batch items failed.',
  )
}

await publish(results)
```

This is an application decision after the batch settles. It does not undo completed work. Preserve successful results and stable input IDs so only failed items need to be retried.

An aborted batch can reject instead of returning a complete result array. Pass `abortSignal` to `runBatch()` when the caller must be able to cancel it; ordinary item failures do not abort that signal.

## 3. Handle parallel branch failure

A parallel stage signals cancellation to sibling branches when one branch rejects, waits for all branches to settle, then rejects with the first branch failure. Pass each branch's `abortSignal` to external work. Cancellation is cooperative and does not roll back completed side effects.

Gather evidence in parallel, then write in a controlled sequential stage. When parallel writes are unavoidable, use idempotency keys and model partial completion explicitly.

## 4. Store safe error shapes

Provider and service errors may include request data, paths, or credentials. Convert them before persistence or display:

```ts
interface PublicJobError {
  code: string
  message: string
  retryable: boolean
}
```

Send raw failures only to restricted observability when policy allows. If writes must be atomic across every input, use a product transaction or redesign the boundary. Pipeline parallelism does not provide distributed transactions.

Next, move restart-sensitive work into [long-running jobs](/sdk/advanced/parallel-and-batch/jobs).
