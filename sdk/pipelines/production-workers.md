# Production workers

Move pipelines into a background worker when they include several provider calls, slow media processing, external writes, or retries that should outlive an HTTP request.

## Split request and execution

| Boundary | Responsibility |
| --- | --- |
| API route | Authenticate, validate input, enqueue a job, return its ID. |
| Worker | Load the job, run the pipeline, persist status and output. |
| Pipeline | Execute the typed workflow and emit stage events. |
| Product store | Own durable job state, idempotency, and user-visible results. |

## Choose a job runner

Production applications typically run these workers with an existing job system instead of building a queue from scratch.

| Runner | Use when |
| --- | --- |
| [BullMQ](https://docs.bullmq.io/guide/introduction) | The application already operates Redis and wants to own its queues, workers, concurrency, and deployment. |
| [Trigger.dev](https://trigger.dev/docs/tasks/overview) | The application wants managed background tasks with built-in retries, queues, concurrency controls, and run visibility. |

Anvia pipelines do not depend on either runner. Define the pipeline in application code, call `pipeline.run(...)` inside the BullMQ worker or Trigger.dev task, and let that system own scheduling and delivery.

## Run from a worker

```ts
export async function runResearchWorker(job: ResearchJob) {
  await researchJobs.markRunning(job.id)

  try {
    const pipeline = createResearchPipeline(workerScope)
    const result = await pipeline.run({
      jobId: job.id,
      tenantId: job.tenantId,
      requestedBy: job.requestedBy,
      topic: job.topic,
    })

    await researchJobs.markComplete(job.id, result)
  } catch (error) {
    await researchJobs.markFailed(job.id, publicWorkerError(error))
    throw error
  }
}
```

Store job status explicitly instead of inferring it from logs. Persist tenant, requester, source, trace, and result references needed to authorize later reads.

## Make retries safe

Retry provider or extractor calls at their narrow boundary. Retry a whole job only when completed writes are idempotent, guarded by a job key, or protected by a transaction.

Do not blindly retry a batch after partial external writes.
