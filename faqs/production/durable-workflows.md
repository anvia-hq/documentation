# Does Anvia provide durable workflow execution?

Not by itself. Anvia pipelines are typed, inspectable runtime workflows; they are not a replacement for a durable job engine that checkpoints execution across process crashes.

A pipeline can sequence ordinary TypeScript steps, agents, extractors, branches, and bounded parallel work. Its graph and events make that composition inspectable. If the process disappears during a run, the application or worker system must decide whether and how to retry it.

## Use a durable system when you need

- execution that survives worker restarts;
- delayed or scheduled work;
- persisted step checkpoints;
- automatic retry with backoff;
- external events or long human waits;
- distributed leases and concurrency limits.

BullMQ, Trigger.dev, a cloud queue, or a durable workflow engine can own that operational state. Anvia remains the function called by a worker or durable step.

## Keep retry boundaries explicit

Retrying a complete pipeline can repeat tool side effects. Give external operations idempotency keys, store stable run IDs, and retry from the narrowest boundary the application can prove safe.

Studio can persist pipeline runs and logs for inspection and replay, but that history does not checkpoint a live Core pipeline or resume it after a process crash.

See [Pipelines](/sdk/pipelines), [production workers](/sdk/pipelines/production-workers), and [retries](/sdk/advanced/parallel-and-batch/retries).
