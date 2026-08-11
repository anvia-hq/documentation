# Production checklist

Review both correctness and operational pressure before increasing parallelism.

## Work boundaries

- Verify parallel branches do not depend on one another's results.
- Keep dependent stages linear and typed.
- Prefer parallel reads and analysis over simultaneous product writes.
- Avoid shared mutable state between branches or batch items.
- Carry stable product IDs through every output.

## Capacity

- Set batch concurrency from the narrowest downstream limit.
- Include nested branches and agent turns when estimating fan-out.
- Add time-based rate limiting for RPM, TPM, and tenant quotas.
- Measure throughput, latency, rate limits, pool pressure, and memory.
- Keep concurrency in trusted runner configuration.

## Failures and retries

- Decide whether the caller needs fail-fast behavior or per-item outcomes.
- Assume in-flight operations can finish after another operation fails.
- Retry failed items instead of rerunning a partially completed batch.
- Add stable idempotency keys before automatic retries around writes.
- Treat validation and authorization failures as terminal.
- Bound retries and use backoff with jitter for transient failures.

## Durability

- Keep short, bounded work in process.
- Move slow, expensive, or restart-sensitive work to a queue.
- Store user-visible status and output references in the product database.
- Reauthorize queued work when the worker begins execution.
- Keep large files and media in object storage, not queue payloads.

## Observability

- Name parallel stages and branches for readable graphs and traces.
- Attach pipeline observers for stage duration and failure events.
- Attach agent observers for model and tool activity inside agent stages.
- Correlate traces with product job, batch, and item IDs.
- Alert on growing queue depth, repeated retries, and partial failure rate.
