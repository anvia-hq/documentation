# Production workers

Move a pipeline into a background worker when it includes several provider calls, slow media processing, external writes, or retries that should outlive an HTTP request.

Anvia executes the typed workflow. Your job system remains responsible for durable delivery, scheduling, worker concurrency, retries, cancellation, and run retention.

## 1. Separate request handling from execution

The API route should authenticate the caller, validate request-specific input, enqueue a job, and return the job ID.

The worker should load trusted job state, construct scoped dependencies, run the pipeline, and persist its status and result.

The product store should own authorization for later status reads, idempotency keys, timestamps, public failure messages, and references to durable outputs.

## 2. Run a pipeline from a worker

```ts
export async function runResearchWorker(job: ResearchJob) {
    await researchJobs.markRunning(job.id);
    try {
        const pipeline = createResearchPipeline({
            tenantId: job.tenantId,
            requestedBy: job.requestedBy,
        });
        const result = await pipeline.run({
            input: {
                jobId: job.id,
                topic: job.topic,
            },
            observer: createJobObserver(job.id)
        });
        await researchJobs.markComplete(job.id, result);
    }
    catch (error) {
        await researchJobs.markFailed(job.id, publicWorkerError(error));
        throw error;
    }
}

```

Store status explicitly instead of inferring it from logs. Persist the tenant, requester, source, trace, and result references needed to authorize later reads.

## 3. Make retries safe

Retry provider or extractor calls at their narrow boundary. Retry a whole job only when completed writes are idempotent, guarded by the job ID, or protected by a transaction.

Assume a worker can stop after an external write but before recording completion. A repeated job must either detect that write or safely replace it.

Do not blindly retry a batch after partial writes. Track item-level state when each input needs its own success or failure result.

## 4. Control deployment concurrency

Pipeline `.runBatch()` limits concurrency inside one process. Worker concurrency, queue delivery, database connections, and provider rate limits are separate controls. Set limits at every layer and monitor active work, queue delay, provider errors, and job age.
