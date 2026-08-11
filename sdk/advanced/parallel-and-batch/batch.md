# Batch runs

Use `pipeline.batch(...)` when every input should pass through the same pipeline independently.

## Process a collection

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const normalizeTicket = new PipelineBuilder(
  z.object({
    id: z.string(),
    body: z.string().min(1),
  }),
)
  .step(({ id, body }) => ({
    id,
    body: body.trim().replace(/\s+/g, ' '),
  }))
  .build()

const normalized = await normalizeTicket.batch(
  [
    { id: 'ticket_1', body: ' Checkout   failed ' },
    { id: 'ticket_2', body: ' Cannot update card ' },
    { id: 'ticket_3', body: ' Password reset issue ' },
  ],
  { concurrency: 2 },
)
```

`batch(...)` returns an array in input order even when later items finish first:

```ts
normalized[0].id === 'ticket_1'
normalized[1].id === 'ticket_2'
normalized[2].id === 'ticket_3'
```

Order preservation makes it possible to pair outputs with input positions, but stable IDs should still travel through the pipeline. IDs are safer when results are persisted, retried, or handled outside the original process.

## Validate every item

When a pipeline starts with a Zod schema, each batch item is parsed before its stages run. Invalid input rejects that item and therefore rejects the batch unless the workflow converts failures into explicit outcomes.

Do not validate only the outer array. Keep item validation at the pipeline boundary so the same rules apply to `.run(...)` and `.batch(...)`.

## Understand what batch owns

Batch provides:

- one pipeline applied to an iterable of inputs
- a required concurrency limit
- ordered outputs
- normal pipeline error propagation

Batch does not provide durable scheduling, progress storage, delayed retries, distributed workers, or per-item job status.

## Keep batches bounded

Use in-process batch execution for a known, reasonably sized input set. A large customer backlog, media library, or ingestion corpus should usually be split into durable jobs so work can resume after a deployment or worker failure.

For per-item error results, see [Failures and results](/sdk/advanced/parallel-and-batch/failures). For durable processing, see [Long-running jobs](/sdk/advanced/parallel-and-batch/jobs).
