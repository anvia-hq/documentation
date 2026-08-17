# Concurrency limits

Concurrency controls how many batch inputs are active at once. Choose it from the narrowest shared dependency, not from the number of inputs waiting.

## 1. Start with a measured limit

```ts
const results = await enrichmentPipeline.runBatch({
    inputs: customers,
    concurrency: 3
});

```

Three is a cautious example, not a universal optimum. Increase it only after measuring latency, errors, and rate-limit headroom.

Inspect the actual bottleneck:

- completion providers: request limits, token limits, latency, 429 responses, and spend
- databases: pool occupancy, locks, transaction duration, and write contention
- external APIs: tenant quotas, burst limits, and downstream capacity
- CPU: core utilization and event-loop delay
- memory: materialized inputs, media buffers, model responses, and retained results

## 2. Account for nested fan-out

Batch concurrency is only the outer limit:

```text
batch concurrency 4 x parallel branches 3
  = up to 12 active branch operations
```

An agent stage may make several model and tool calls as well. Measure the complete workflow rather than interpreting `concurrency: 4` as four provider requests.

`.parallel()` starts every named branch for one item and has no separate branch-concurrency option. Keep branch counts bounded or put an application-owned limiter inside a branch pipeline.

## 3. Separate concurrency from rate limiting

A concurrency cap bounds simultaneous work. It does not enforce requests or tokens per minute. Fast requests can still exceed a time-based quota.

Use a rate limiter or queue policy for burst, RPM, TPM, and tenant quotas. Respect downstream retry guidance when the adapter exposes it.

## 4. Tune with evidence

Increase the limit gradually while tracking total throughput, item latency, provider errors, rate-limit responses, database saturation, memory, CPU, and cost per completed item.

Stop when throughput flattens or reliability degrades. More parallelism can make the batch slower through contention and retries.

## 5. Keep the limit trusted

```ts
const concurrency = config.ticketBatchConcurrency;
await ticketPipeline.runBatch({
    inputs: inputs,
    concurrency
});

```

Do not accept an unrestricted value from an HTTP body or model-generated argument.

Next, design [failure and result handling](/sdk/advanced/parallel-and-batch/failures).
