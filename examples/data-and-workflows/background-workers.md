# Background workers

**Level:** Application

## Outcome

Move a slow Anvia pipeline behind a durable application job boundary, return a job ID immediately,
and let a worker publish progress and results safely.

## When to use it

Use a worker for document processing, research, batch generation, or tasks that can outlive an HTTP
request. Keep short interactive prompts in the request process.

## Architecture and ownership

```text
authenticated API -> application DB job row -> BullMQ or Trigger.dev
                                             -> worker -> Anvia pipeline
                                             -> result/status in application DB
```

Anvia provides the pipeline executed by the worker. BullMQ, Trigger.dev, or another job platform is
suggested application infrastructure; it owns delivery, leases, scheduling, and retries. Your
database owns user-visible status and authorization.

## Setup

Install Anvia packages for the pipeline plus the queue SDK and database client selected by your
application. Configure a separate worker process and use server-side secrets; this pattern does not
require or imply a particular queue package.

## Producer boundary

```ts
const input = JobInput.parse(await request.json());
await authorizeProject(request, input.projectId);

const job = await jobs.insert({
  projectId: input.projectId,
  state: "queued",
  requestedBy: request.user.id,
});

await queue.add("research", { jobId: job.id }, { jobId: job.id });
return Response.json({ jobId: job.id }, { status: 202 });
```

Only enqueue a database identifier. Do not place secrets, full documents, or untrusted authorization
claims in the queue payload.

## Worker boundary

```ts
async function processResearchJob(jobId: string): Promise<void> {
  const claimed = await jobs.claim(jobId); // atomic application operation
  if (!claimed) return;

  try {
    const input = await projects.authorizedResearchInput(claimed.projectId);
    const output = await researchPipeline.run(input, {
      observer: {
        onEvent: (event) => jobs.recordPipelineEvent(jobId, event),
      },
    });
    await jobs.complete(jobId, output);
  } catch (error) {
    await jobs.fail(jobId, safeErrorCode(error));
    throw error; // let the queue apply its configured retry policy
  }
}
```

The repository methods and queue client above are intentionally application-owned interfaces, not
exports from Anvia.

## Expected behavior and failures

The API returns `202` quickly. A worker claims the job exactly once at the database boundary, runs
the pipeline, and records a terminal state. Queue delivery is commonly at least once, so duplicate
delivery must not duplicate effects. A worker crash after a provider call but before `complete()` is
the critical scenario to test.

Run the API and worker separately, submit one job, then poll the application job record. You should
observe `queued -> running -> succeeded` and one stored result. Kill the worker during a test job to
verify lease recovery before treating the design as durable.

## Security and production adaptations

Re-authorize access when reading job status. Use opaque IDs, encrypt sensitive source data, limit
worker egress, and separate queues by trust level. Add idempotency keys for every external write,
lease expiry, retry ceilings, a dead-letter queue, progress throttling, and graceful shutdown. Do not
assume a `PipelineRunObserver` is a durable event store.

## Tests

Test producer authorization, duplicate queue delivery, worker crash recovery, retry exhaustion,
dead-letter routing, and a result that is written once. Unit-test the Anvia pipeline without the
queue; integration-test the queue adapter separately.

## Source and extensions

- Adapt [pipeline production workers](/sdk/pipelines/production-workers).
- The unit of work can be based on [`05_pipelines/08-research-pipeline.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/05_pipelines/08-research-pipeline.ts).
- Extend with webhook completion, polling, resumable UI status, or per-tenant worker quotas.
