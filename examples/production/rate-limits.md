# Rate-limit agent traffic

**Level:** Application

## Outcome

Apply product quotas before expensive work, then bound provider concurrency so one tenant or traffic
spike cannot exhaust the service.

## When to use it

Use rate limits on every public agent endpoint and worker fleet. Request rate, token budgets,
concurrency, and provider quotas are different controls and usually need separate policies.

## Architecture and ownership

```text
authenticated request -> tenant/user limiter -> concurrency admission -> Anvia request
worker job            -> tenant queue quota  -> provider limiter    -> Anvia pipeline
```

Anvia does not ship a distributed rate limiter. Use application infrastructure such as Redis with a
tested limiter, an API gateway, or your job platform. `pipeline.batch({ concurrency })` bounds only
one in-process batch.

## Setup

Configure a distributed limiter or gateway shared by every instance. Install its SDK in the
application; there is no Anvia rate-limiter package. Define quota keys and failure policy before
enabling the endpoint.

## Endpoint boundary

```ts
const key = `agent:${principal.tenantId}:${principal.userId}`;
const decision = await limiter.consume(key, { cost: 1 });

if (!decision.allowed) {
  return Response.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(decision.retryAfterMs / 1_000)) },
    },
  );
}

const permit = await modelConcurrency.tryAcquire(principal.tenantId);
if (!permit) return Response.json({ error: "busy" }, { status: 503 });

try {
  return Response.json(await runAuthorizedAgentRequest());
} finally {
  await permit.release();
}
```

`limiter` and `modelConcurrency` are application-owned abstractions. Resolve the authenticated
principal first so attackers cannot choose another tenant's quota key.

## Token-aware accounting

Reserve an estimated budget before the call, then reconcile with `response.usage` after completion.
Define what happens when usage metadata is unavailable. Never rely on client-reported token counts.

## Expected behavior and failure scenarios

Accepted traffic remains within configured burst and sustained limits. Rejected traffic never calls
the model. A limiter outage needs an explicit fail-open or fail-closed policy per endpoint; high-cost
or high-risk operations should normally fail closed. Ensure permits are released in `finally`, even
when the provider rejects.

Exercise the endpoint until it returns `429`, confirm `Retry-After`, then advance the limiter clock or
wait for refill and confirm a new request is admitted.

## Security and production adaptations

Use separate keys for tenant, user, API credential, and source IP where appropriate. Cap cardinality,
expire idle keys, prevent spoofed forwarding headers, and alert on repeated rejections. Coordinate
limits with provider accounts and queue depth. Rate limiting reduces abuse; it does not replace
authorization, content controls, or billing enforcement.

## Tests

Use deterministic time to test burst, refill, and `Retry-After`. Test simultaneous requests, permit
release on failure, multiple workers sharing state, limiter outages, and token reconciliation.

## Source and extensions

- For finite local batches, see [`05_pipelines/05-batch-run.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/05_pipelines/05-batch-run.ts).
- Continue to [retries and timeouts](/examples/production/retries-and-timeouts) and [durable jobs](/examples/production/durable-jobs).
- Extend with plan-based quotas, cost ceilings, and adaptive provider backpressure.
