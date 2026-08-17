# Long-running jobs

Use a durable job system when work must outlive an HTTP request, survive restarts, expose progress, or retry later.

## 1. Separate request acceptance from execution

```text
HTTP route
  |- authenticate and validate
  |- create product job record
  |- enqueue stable job ID
  `- return 202 Accepted

Worker
  |- load job and current permissions
  |- claim or mark running
  |- run pipeline
  |- record progress
  `- save completed or failed status
```

The queue owns delivery. The product database owns user-visible status, input ownership, output references, and safe error summaries.

## 2. Keep the queue message small

```ts
type TicketBatchJob = {
  jobId: string
  tenantId: string
  requestedBy: string
}
```

Load current inputs and authorization state in the worker. Do not serialize provider clients, database connections, trusted user objects, or large media bytes into a queue message.

## 3. Run the pipeline in a worker

```ts
export async function runTicketBatchJob(input: TicketBatchJob) {
    const job = await jobs.loadForWorker(input.jobId, input.tenantId);
    await permissions.assertCanProcessTickets({
        tenantId: input.tenantId,
        userId: input.requestedBy,
    });
    await jobs.markRunning(job.id);
    try {
        const output = await ticketPipeline.run({
            input: job.pipelineInput,
            observer: {
                async onEvent(event) {
                    await jobs.recordPipelineEvent(job.id, event);
                },
            }
        });
        await jobs.markCompleted(job.id, output);
    }
    catch (error) {
        await jobs.markFailed(job.id, toPublicError(error));
        throw error;
    }
}

```

Throwing after recording the failure lets the queue apply its delivery policy. Enable redelivery only after the pipeline's side effects are safe to repeat.

## 4. Choose infrastructure by required guarantees

Evaluate delivery semantics, scheduled retries, concurrency controls, cancellation, visibility, operational ownership, and regional or compliance requirements.

Anvia does not require a particular queue. Keep the pipeline callable from plain TypeScript so the transport and worker framework remain replaceable.

## 5. Expose product status

Let the UI poll or subscribe to a product-owned status endpoint. Do not keep the original HTTP request open merely because the pipeline can execute in process.

Streaming is appropriate when live incremental output is itself a product requirement. It does not supply durability or resumability.

Next, design [retries and idempotency](/sdk/advanced/parallel-and-batch/retries).
