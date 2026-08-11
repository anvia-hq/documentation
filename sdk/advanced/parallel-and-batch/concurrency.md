# Concurrency limits

Concurrency controls how many batch inputs are active at once. Choose it from the capacity of the slowest shared dependency, not from the number of inputs waiting.

## Start with a small limit

```ts
const results = await enrichmentPipeline.batch(customers, {
  concurrency: 3,
})
```

Three is not a universal optimum. It is a deliberately small starting point for external model and service calls that can be increased after measuring latency, errors, and rate-limit headroom.

| Bottleneck | What to inspect |
| --- | --- |
| Completion provider | Request and token limits, latency, 429 responses, spend. |
| Database | Connection pool, locks, transaction duration, write contention. |
| External API | Tenant quotas, burst limits, retry headers, downstream capacity. |
| CPU | Core utilization and event-loop delay. |
| Memory | Input size, media buffers, model responses, retained results. |

## Account for nested fan-out

Batch concurrency is only the outer limit. A pipeline that launches three parallel branches can create roughly three times as many downstream operations:

```text
batch concurrency 4 × parallel branches 3
              = up to 12 active branch operations
```

Agents inside a branch can also make multiple model and tool calls. Measure the complete workflow rather than assuming `concurrency: 4` means only four provider requests.

## Concurrency is not rate limiting

A concurrency limit bounds simultaneous work. It does not enforce requests per minute or tokens per minute. Fast requests can still exceed a provider's time-based quota.

Use a rate limiter or queue policy when a dependency has burst, RPM, TPM, or tenant-specific quotas. Respect provider retry guidance instead of immediately replacing a rate-limited request with another concurrent attempt.

## Tune with evidence

Increase concurrency gradually while tracking:

- total throughput
- p50 and p95 item duration
- provider and service error rates
- rate-limit responses
- database pool saturation
- memory and CPU pressure
- cost per completed item

Stop increasing when throughput flattens or reliability degrades. Higher concurrency can reduce individual idle time while making the complete batch slower through contention and retries.

## Limit at the runner boundary

Keep the chosen limit in trusted application configuration:

```ts
const concurrency = config.ticketBatchConcurrency

await ticketPipeline.batch(inputs, { concurrency })
```

Do not accept an unrestricted concurrency value from an HTTP body or agent-generated tool argument.
