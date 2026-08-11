# Parallel and batch

Parallel and batch execution reduces waiting time when work is genuinely independent. Anvia provides two pipeline primitives for two different shapes of work.

## Choose the execution shape

| Requirement | Primitive | Result |
| --- | --- | --- |
| Run several operations from one value | `.parallel({...})` | One object keyed by branch name. |
| Run the same pipeline for many values | `pipeline.batch(inputs, options)` | One ordered array of outputs. |
| Survive restarts or process a large backlog | Worker queue | Durable jobs with application-owned status. |

```text
Parallel                              Batch

one ticket                            ticket A ─┐
   ├─ classify                        ticket B ─┼─ same pipeline
   ├─ detect risk                     ticket C ─┘
   └─ estimate priority
        ↓                                  ↓
one combined result                   ordered results
```

## Explore parallel and batch work

| Page | Learn how to |
| --- | --- |
| [Parallel branches](/sdk/advanced/parallel-and-batch/parallel) | Fan one value into independent named operations. |
| [Batch runs](/sdk/advanced/parallel-and-batch/batch) | Process many inputs through one pipeline. |
| [Concurrency limits](/sdk/advanced/parallel-and-batch/concurrency) | Bound pressure on models, services, and local resources. |
| [Failures and results](/sdk/advanced/parallel-and-batch/failures) | Choose fail-fast or per-item outcomes. |
| [Long-running jobs](/sdk/advanced/parallel-and-batch/jobs) | Move durable work behind a queue and worker. |
| [Retries and idempotency](/sdk/advanced/parallel-and-batch/retries) | Retry the smallest safe boundary. |
| [Production checklist](/sdk/advanced/parallel-and-batch/checklist) | Review dependencies, limits, state, and observability. |

## Use parallel branches

```ts
const triage = new PipelineBuilder(ticketSchema)
  .parallel({
    classification: classifyTicket,
    policy: checkPolicy,
    urgency: estimateUrgency,
  })
  .step(({ classification, policy, urgency }) => ({
    category: classification.category,
    allowed: policy.allowed,
    priority: urgency.priority,
  }))
  .build()
```

Every branch receives the same parsed ticket. The next step receives an object whose keys match the branch names.

## Run a batch

```ts
const results = await triage.batch(tickets, {
  concurrency: 3,
})
```

At most three inputs run concurrently, and the returned results preserve the order of `tickets`.

## Parallelism is not durability

Both primitives run inside the current JavaScript process. They do not create durable jobs, persist progress, or survive a process restart.

Use them for bounded in-process work. Use BullMQ, Trigger.dev, or another job system when work must continue independently of an HTTP request or application instance.
