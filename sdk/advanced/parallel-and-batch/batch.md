# Batch runs

Use `pipeline.runBatch()` when every input should pass through the same pipeline independently.

## 1. Process a collection

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const normalizeTicket = new Pipeline({
    id: 'normalize-ticket',
    inputSchema: z.object({
        id: z.string(),
        body: z.string().min(1),
    }),
}).step({
  id: 'normalize-body',
  run: ({ input: { id, body } }) => ({
    id,
    body: body.trim().replace(/\s+/g, ' '),
  }),
});
const normalized = await normalizeTicket.runBatch({
  inputs: [
    { id: 'ticket_1', body: ' Checkout   failed ' },
    { id: 'ticket_2', body: ' Cannot update card ' },
    { id: 'ticket_3', body: ' Password reset issue ' },
  ],
  concurrency: 2,
});

```

The returned settled-item array preserves input order:

```ts
for (const item of normalized) {
  if (item.status === 'completed') {
    console.log(item.runId, item.output.id);
  } else {
    console.error(item.runId, item.error);
  }
}
```

Carry stable IDs through the output as well. Array positions are insufficient after persistence, partial retries, or distributed processing.

## 2. Validate every item

Each item is parsed by the pipeline's `inputSchema` before its stages run. Invalid input follows the same failure path as any other thrown error.

Do not validate only the outer collection. Keeping validation at the pipeline boundary makes `.run()` and `.runBatch()` consistent.

## 3. Know the worker behavior

`concurrency` is required and must be a positive safe integer. Anvia materializes the iterable, starts up to that many workers, and stores each settled result by original index.

An item failure becomes `{ status: 'failed', runId, error }` while other workers continue. A successful item becomes `{ status: 'completed', runId, output }`. The batch itself rejects when its abort signal fires.

## 4. Know what batch does not provide

Batch provides bounded in-process execution, ordered settled results, and the same observer options as `.run()`. It does not provide durable scheduling, progress storage, delayed retries, or distributed workers.

If each item needs an observer, status record, or independent retry lifecycle, run it through an application worker boundary rather than treating one large batch as a durable job.

## 5. Keep the input bounded

Because the iterable is materialized before execution, avoid passing an unbounded generator or an enormous backlog. Split large corpora into durable jobs or bounded pages.

Next, choose [concurrency limits](/sdk/advanced/parallel-and-batch/concurrency).
