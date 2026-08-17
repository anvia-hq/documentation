# Failures and results

Choose whether one failed input should reject the batch or become an explicit item result.

## 1. Use default fail-fast scheduling

```ts
try {
    const results = await enrichmentPipeline.runBatch({
        inputs: inputs,
        concurrency: 3
    });
    await publish(results);
}
catch (error) {
    await batchRuns.markFailed(batchId, toPublicError(error));
}

```

After the first failure, workers stop starting new items. Items already in flight finish, and the batch then rejects with the first error.

Rejection is not rollback. Completed items and external side effects remain completed, and the batch does not return their successful values.

## 2. Return explicit per-item outcomes

When every input needs a status, convert the failure inside the pipeline:

```ts
const safeEnrichment = new Pipeline({
    id: 'safe-ticket-enrichment',
    inputSchema: ticketSchema,
}).step({
    id: "step-1",
    run: async ({ input: ticket }) => {
        try {
            return {
                ok: true as const,
                id: ticket.id,
                value: await enrichTicket(ticket),
            };
        }
        catch (error) {
            return {
                ok: false as const,
                id: ticket.id,
                error: toPublicError(error),
            };
        }
    }
});
const outcomes = await safeEnrichment.runBatch({
    inputs: tickets,
    concurrency: 3
});
const failed = outcomes.filter((outcome) => !outcome.ok);

```

This prevents expected item failures from rejecting the outer batch. Do not catch process-level cancellation or errors that should stop the worker.

## 3. Handle parallel branch failure

A parallel stage rejects when any branch rejects. Other branch operations were already started and are not cancelled automatically.

Gather evidence in parallel, then write in a controlled sequential stage. When parallel writes are unavoidable, use idempotency keys and model partial completion explicitly.

## 4. Store safe error shapes

Provider and service errors may include request data, paths, or credentials. Convert them before persistence or display:

```ts
type PublicJobError = {
  code: string
  message: string
  retryable: boolean
}
```

Send raw failures only to restricted observability when policy allows.

## 5. Choose the product behavior

Let the batch reject when downstream work requires every result. Return item outcomes when operators need success and failure counts. Persist stable IDs and enqueue only failed items for later retry.

If writes must be atomic across every input, use a product transaction or redesign the boundary. Pipeline parallelism does not provide distributed transactions.

Next, move restart-sensitive work into [long-running jobs](/sdk/advanced/parallel-and-batch/jobs).
