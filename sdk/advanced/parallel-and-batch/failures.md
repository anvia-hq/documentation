# Failures and results

Choose whether one failed input should reject the batch or become an explicit result. The right behavior depends on whether callers need all-or-nothing control flow or per-item reporting.

## Default batch behavior

`pipeline.batch(...)` rejects when an item throws. This is useful when any missing output means the caller cannot continue safely.

```ts
try {
  const results = await enrichmentPipeline.batch(inputs, {
    concurrency: 3,
  })

  await publish(results)
} catch (error) {
  await batchRuns.markFailed(batchId, toPublicError(error))
}
```

Do not interpret rejection as rollback. Other inputs or parallel branches may already have completed external work.

## Return per-item outcomes

When every input needs a status, catch the item-level failure inside the pipeline and return a discriminated result:

```ts
const safeEnrichment = new PipelineBuilder(ticketSchema)
  .step(async (ticket) => {
    try {
      const value = await enrichTicket(ticket)

      return {
        ok: true as const,
        id: ticket.id,
        value,
      }
    } catch (error) {
      return {
        ok: false as const,
        id: ticket.id,
        error: toPublicError(error),
      }
    }
  })
  .build()

const outcomes = await safeEnrichment.batch(tickets, {
  concurrency: 3,
})

const failed = outcomes.filter((outcome) => !outcome.ok)
```

Keep the original stable ID in both variants. The returned array preserves input order, but the ID remains necessary for storage and targeted retries.

## Avoid leaking raw errors

Thrown provider and service errors can contain request data, internal paths, or credentials. Convert them into an application-owned error shape before persistence or display:

```ts
type PublicJobError = {
  code: string
  message: string
  retryable: boolean
}
```

Send raw failures to restricted observability when policy allows; store a safe summary with the product job.

## Decide where to stop

| Requirement | Behavior |
| --- | --- |
| Downstream step requires every result | Let the batch reject. |
| Operator needs success and failure counts | Return per-item outcomes. |
| Failed items should retry later | Persist IDs and enqueue only failures. |
| Writes must be atomic across all inputs | Use a product transaction or redesign the boundary. |

Pipeline parallelism does not provide distributed transactions. Make partial completion an explicit product state when it is possible.
