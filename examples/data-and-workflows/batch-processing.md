# Batch processing

**Level:** Pattern

## Outcome

Process a finite collection through one typed pipeline with bounded in-process concurrency while
preserving input order in the returned results.

## When to use it

Use `pipeline.runBatch()` for small, already-loaded batches in a single process. Use an application-owned
queue when work must survive restarts, span machines, be scheduled, or be retried per item.

## Flow

```text
items[] -> bounded worker pool -> pipeline.run({ input }) -> ordered settled results[]
```

## Setup and implementation

```sh
pnpm add @anvia/core zod
```

```ts
import { Pipeline } from "@anvia/core/pipeline";
import { z } from "zod";
const Ticket = z.object({ id: z.string(), summary: z.string().min(1) });
const normalizeTicket = new Pipeline({ id: "normalize-ticket", inputSchema: Ticket })
    .step({
    id: "step-1",
    run: ({ input: input }) => (({ id, summary }) => ({
        id,
        normalized: summary.trim().replace(/\s+/g, " "),
    }))(input)
})
    .step({
    id: "step-2",
    run: ({ input: ticket }) => ({
        ...ticket,
        priority: /outage|missed orders/i.test(ticket.normalized)
            ? "high" as const
            : "normal" as const,
    })
});
const tickets = [
    { id: "t1", summary: "Payment latency in EU." },
    { id: "t2", summary: "Search outage for administrators." },
    { id: "t3", summary: "Webhook retries are delayed." },
];
const results = await normalizeTicket.runBatch({
    inputs: tickets,
    concurrency: 2
});
console.log(results);

```

## Expected behavior

At most two pipeline runs are active. `results[0]` still corresponds to `tickets[0]`, even if the
second item finishes first. Every item is `{ status: 'completed', runId, output }` or
`{ status: 'failed', runId, error }`; one failure does not reject the whole batch.

## Failure scenarios and production ownership

- Validate the concurrency value in product configuration; Anvia normalizes it to at least one.
- A failed item is recorded while other items continue.
- Large arrays remain in memory and can overload a provider or database.
- Provider rate limits need a rate-aware scheduler, not just a concurrency number.

For durable import jobs, store one item or chunk per BullMQ/Trigger.dev job, include an idempotency
key, and record status in your database. Those systems own leases, retries, scheduling, and recovery;
the Anvia pipeline remains the deterministic unit of work inside a job.

## Security, tests, and extensions

Authorize the batch before processing and re-check item-level tenant ownership inside the worker.
Test ordering, the concurrency ceiling, invalid input, and one rejected item. Extend the pattern with
chunked input reads, provider-specific throttling, progress records, and a dead-letter queue.

## Source

- [`05_pipelines/05-batch-run.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/05_pipelines/05-batch-run.ts)
- [Parallel and batch pipelines](/sdk/pipelines/parallel-and-batch)
