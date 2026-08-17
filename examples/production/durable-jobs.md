# Durable agent jobs

**Level:** Application

## Outcome

Run agent work with at-least-once queue delivery without duplicating business effects, while exposing
a durable status record to clients and operators.

## When to use it

Use durable jobs when work can outlive a request, must retry after process failure, or needs operator
replay. A plain `pipeline.run()` or `runBatch()` is in-process and does not survive a restart.

## Architecture

```text
API transaction -> job row + outbox -> BullMQ/Trigger.dev -> worker
                                                   |-> Anvia pipeline
                                                   `-> checkpoint/result rows
```

BullMQ and Trigger.dev are suggested application choices, not Anvia packages. Your queue and database
own delivery, leases, state transitions, idempotency, and retention.

## Setup

Install the Anvia packages used by the job's pipeline. Separately configure the database and BullMQ,
Trigger.dev, or another durable job system selected by your application. Create the job, lease,
outbox, result, and audit records before starting workers.

## Durable contract

```ts
type JobState = "queued" | "running" | "succeeded" | "failed";

type AgentJob = {
  id: string;
  tenantId: string;
  inputRef: string;
  state: JobState;
  attempt: number;
  version: number;
};
```

Create the job and outbox event in one database transaction. A relay publishes the outbox record to
the queue; duplicate publication is safe because the queue job ID equals the application job ID.

## Worker boundary

```ts
async function execute(jobId: string) {
    const job = await jobs.claim(jobId); // atomic queued/failed -> running transition
    if (!job)
        return;
    try {
        const input = await inputs.loadAuthorized(job.tenantId, job.inputRef);
        const output = await durablePipeline.run({
            input: input
        });
        await jobs.succeed(job.id, job.version, output);
    }
    catch (error) {
        const retryable = classifyFailure(error) === "transient";
        await jobs.fail(job.id, job.version, safeError(error), retryable);
        if (retryable)
            throw error;
    }
}

```

The named repositories and failure classifier are application code. Keep large or sensitive payloads
out of queue messages; enqueue references to protected storage.

## Expected behavior and recovery

Duplicate delivery finds a completed or already-claimed row and becomes a no-op. A worker crash lets
the lease expire and another worker claim the attempt. A crash after an external side effect is safe
only when that side effect used a stable idempotency key or can be reconciled.

Submit one job and inspect the durable row until it succeeds. Then publish the same job ID twice and
verify that the result and external effects are still written once.

## Security and production adaptations

Authorize job creation and every status read. Encrypt source and result storage, separate tenants in
queries, expire old payloads, and restrict worker credentials. Add retry ceilings, dead-letter state,
lease heartbeats, graceful shutdown, outbox monitoring, and a manual replay action that preserves the
original audit record.

## Tests

Test duplicate outbox delivery, duplicate queue delivery, lease expiry, crash after model output,
crash after an external effect, stale worker versions, retry exhaustion, unauthorized status reads,
and result retention. Run the Anvia pipeline tests independently of queue integration tests.

## Source and extensions

- Start from [background workers](/examples/data-and-workflows/background-workers).
- Pipeline unit source: [`05_pipelines/08-research-pipeline.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/05_pipelines/08-research-pipeline.ts)
- Review [pipeline production workers](/sdk/pipelines/production-workers).
- Extend with scheduled jobs, webhook completion, checkpointed multi-stage execution, or per-tenant queues.
