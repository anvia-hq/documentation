# Long-running jobs

Use a job system when work must outlive an HTTP request, survive restarts, expose progress, or retry later.

## Separate request and execution

```text
HTTP route
   ├─ authenticate and validate
   ├─ create product job record
   ├─ enqueue stable job ID
   └─ return 202 Accepted

Worker
   ├─ load job and current permissions
   ├─ mark running
   ├─ run pipeline
   ├─ record stage progress
   └─ save completed or failed status
```

The queue owns delivery. The product database owns user-visible status, input ownership, output references, and error summaries.

## Keep the queued payload small

```ts
type TicketBatchJob = {
  jobId: string
  tenantId: string
  requestedBy: string
}
```

Load the current inputs and authorization state in the worker. Do not serialize database connections, provider clients, large media bytes, or a trusted user object into the queue message.

## Run the pipeline in a worker

```ts
export async function runTicketBatchJob(input: TicketBatchJob) {
  const job = await jobs.loadForWorker(input.jobId, input.tenantId)

  await permissions.assertCanProcessTickets({
    tenantId: input.tenantId,
    userId: input.requestedBy,
  })

  await jobs.markRunning(job.id)

  try {
    const output = await ticketPipeline.run(job.input, {
      observer: {
        async onEvent(event) {
          await jobs.recordStage(job.id, event)
        },
      },
    })

    await jobs.markCompleted(job.id, output)
  } catch (error) {
    await jobs.markFailed(job.id, toPublicError(error))
    throw error
  }
}
```

The worker throws after recording failure so the queue can apply its configured retry policy. Ensure retries are safe before enabling them.

## Choose a job system

Common production choices include:

| System | Good fit |
| --- | --- |
| [BullMQ](https://docs.bullmq.io/guide/introduction) | The application already operates Redis and wants direct control over queues and workers. |
| [Trigger.dev](https://trigger.dev/docs/tasks/overview) | The application wants managed task execution, retries, concurrency, and run visibility. |

Anvia does not require either one. Keep the pipeline callable from a plain TypeScript runner so the job adapter remains replaceable.

## Expose status, not the worker

Let the UI poll or subscribe to a product-owned job status endpoint. Do not keep the original route open merely because the pipeline can run in process.

Use streaming only when live incremental output is itself a product requirement. Durability and resumability still need an owner outside the browser connection.
