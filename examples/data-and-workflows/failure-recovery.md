# Failure recovery

**Level:** Pattern

## Outcome

Classify failures by boundary, retry only safe transient model calls, and resume durable workflows
from application checkpoints instead of replaying every side effect.

## When to use it

Apply this pattern to any pipeline that mixes model calls, databases, and external actions. Simple
read-only transformations can usually fail and be run again from the beginning.

## Setup

Use `@anvia/core` for the agent or pipeline. Add your database and queue clients only when the
workflow needs durable checkpoints; the repository interfaces below are application code.

## Failure model

```text
validation -> no retry
authorized read -> bounded retry if transient
model completion -> Anvia completion retry policy
external write -> application idempotency + durable checkpoint
```

## Request-level completion retries

```ts
const response = await agent.generate({
    prompt: input,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 2000,
        shouldRetry: ({ error }) => isTransientProviderFailure(error),
    }
});
```

Anvia's default completion retry classifier covers common timeouts, connection failures, `429`, and
`5xx` responses, and does not retry `AbortError`. `maxAttempts` includes the initial call. Streaming
is not retried after provider progress because replaying partial output would duplicate content.

## Durable checkpoint boundary

```ts
async function runJob(jobId: string) {
  const job = await jobs.load(jobId);

  const draft = job.draft ?? await createDraft(job.input);
  if (!job.draft) await jobs.saveDraft(jobId, draft);

  if (!job.externalActionId) {
    const action = await externalApi.apply(draft, { idempotencyKey: jobId });
    await jobs.saveExternalAction(jobId, action.id);
  }

  await jobs.complete(jobId);
}
```

The checkpoint repository, error classifier, external API, deadlines, and queue retry policy are
application-owned. `PipelineRunObserver` reports stage events but does not persist checkpoints.

## Expected behavior and failure scenarios

A transient completion may retry within the request. Invalid input fails immediately. After a crash,
the durable job reloads its checkpoint and skips completed effects. Exhausted retries move the job to
a visible failed state rather than looping forever.

Watch for ambiguous provider failures: a timed-out external write may have succeeded. Resolve with
provider idempotency keys or reconciliation, never an unconditional replay.

## Security and production adaptations

Do not expose raw provider errors to clients. Store a safe category and keep full diagnostics in
restricted telemetry. Cap attempts and elapsed time, add jitter, honor provider retry guidance, and
use a dead-letter queue. Treat authentication failures as terminal until credentials change.

## Tests

Inject failures before and after every checkpoint. Assert retry count, backoff policy, no retries for
validation or authorization failures, no duplicated external effects, and correct recovery after a
worker restart. Use fake time for backoff tests.

## Source and extensions

- Retry implementation: [`retry.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/core/src/retry.ts)
- Read [pipeline runs and errors](/sdk/pipelines/runs-and-errors) and [background workers](/examples/data-and-workflows/background-workers).
- Extend with circuit breakers, provider fallback, reconciliation jobs, and operator replay tooling.
