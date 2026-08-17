# Parallel and batch production checklist

Review correctness, operational pressure, and restart behavior before increasing concurrency.

## Work boundaries

- Verify parallel branches do not depend on one another's results.
- Keep dependent stages linear and typed.
- Prefer parallel reads and analysis over simultaneous product writes.
- Avoid shared mutable state between branches and batch items.
- Carry stable product IDs through every output.
- Remember that branch failures do not cancel already-started work.

## Capacity

- Set batch concurrency from the narrowest downstream limit.
- Include nested branches and agent turns when estimating fan-out.
- Add time-based limiting for RPM, TPM, burst, and tenant quotas.
- Measure throughput, latency, rate limits, pool pressure, memory, and cost.
- Keep concurrency in trusted runner configuration.
- Keep batch inputs bounded because Anvia materializes the iterable.

## Failures and retries

- Decide between outer rejection and explicit per-item outcomes.
- Expect in-flight items to finish after the first batch failure.
- Retry failed items instead of rerunning a partial batch blindly.
- Add stable idempotency keys before retrying writes.
- Treat validation and authorization failures as terminal.
- Bound transient retries and use backoff with jitter.

## Durability

- Keep short bounded work in the current process.
- Move slow, expensive, or restart-sensitive work to a durable queue.
- Store user-visible status and output references in the product database.
- Reauthorize queued work when the worker begins execution.
- Keep large files and media in object storage, not queue messages.

## Observability

- Name pipeline stages and branches for readable graphs and events.
- Pass a `PipelineRunObserver` to individual `.run()` calls.
- Attach agent observers for model and tool activity inside agent stages.
- Correlate traces with product job, batch, and item IDs.
- Alert on queue depth, repeated retries, and partial-failure rate.

## Final verification

- Confirm successful batch outputs preserve input order.
- Confirm invalid concurrency fails before processing.
- Test one branch failure and one batch item failure.
- Test worker redelivery after a process interruption.
- Verify duplicate writes are prevented by idempotency.
- Verify stored and displayed errors contain no sensitive internal data.
