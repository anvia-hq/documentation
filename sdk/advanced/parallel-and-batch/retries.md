# Retries and idempotency

Retry only at a boundary where repeated execution has a defined outcome. A retry strategy is incomplete until side effects are idempotent or transactionally protected.

## Choose the smallest safe boundary

| Failure | Prefer |
| --- | --- |
| Temporary model invocation error | Use request-scoped `.withCompletionRetries(...)`. |
| Extractor returns invalid data | Use the extractor's bounded `.retries(...)`. |
| One independent batch item fails | Retry that item by stable ID. |
| Worker loses its process before a write | Redeliver the job with an idempotency key. |
| Whole batch partially completes | Resume failed or missing items; do not rerun everything blindly. |

Whole-pipeline retries are safe only when every completed side effect can be repeated or detected.

## Make writes idempotent

Derive an idempotency key from product identity and operation identity—not from a random retry attempt:

```ts
const idempotencyKey = [
  'ticket-enrichment',
  job.id,
  ticket.id,
].join(':')

await ticketService.saveEnrichment({
  ticketId: ticket.id,
  enrichment,
  idempotencyKey,
})
```

If the worker retries the same ticket, the service can return the existing result instead of applying the write twice.

## Keep retry state outside the prompt

The queue or runner should own job attempt count, delay, backoff, and terminal status. Attach useful correlation data to the agent trace:

```ts
await agent
  .prompt(ticketPrompt)
  .withTrace({
    metadata: {
      jobId: job.id,
      jobAttempt: job.attempt,
    },
  })
  .withCompletionRetries({
    maxAttempts: 3,
    initialDelayMs: 200,
    maxDelayMs: 2_000,
  })
  .send()
```

Completion retries repeat only a failed model invocation within the current turn. They do not restart the agent run or repeat completed tool calls. Do not ask the model to decide whether infrastructure failures deserve another attempt.

## Use backoff for transient failures

Retries should be bounded and delayed. Anvia completion retries use exponential backoff with full jitter and conservative transient-error classification. They use their configured local timing rather than interpreting provider `Retry-After` headers.

At service and queue boundaries, respect downstream retry guidance when the integration exposes it. Stop retrying validation, authorization, and permanent input errors.

Classify errors at the adapter or runner boundary so the job system can distinguish retryable failures from terminal ones.

## Do not confuse retry with replay

A retry executes work again and may create side effects. Reopening a stored result or trace only inspects what already happened.

When operators manually retry a failed job, create a new attempt linked to the original job while preserving the same operation-level idempotency keys.
