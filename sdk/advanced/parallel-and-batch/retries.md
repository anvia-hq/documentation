# Retries and idempotency

Retry only at a boundary where repeated execution has a defined outcome. A retry policy is incomplete until side effects are idempotent or transactionally protected.

## 1. Choose the smallest safe boundary

Prefer the narrowest owner:

- retry a transient completion request with agent run options
- retry a failed structured extraction with extractor options
- retry one independent batch item by stable ID
- let a queue redeliver a durable job with operation-level idempotency
- resume failed or missing items instead of rerunning a partially completed batch

`Pipeline` has no built-in whole-run retry option. Wrap it at an application boundary only when replay is safe.

## 2. Retry model requests, not completed tools

```ts
const result = await agent.generate({
    prompt: ticketPrompt,
    trace: {
        metadata: {
            jobId: job.id,
            jobAttempt: job.attempt,
        },
    },
    retries: {
        maxAttempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 2000,
    }
})
```

Agent retries repeat a failed completion invocation within the current turn. They do not restart the complete agent run or repeat already completed tool calls.

Retry delays use capped exponential backoff with full jitter. The default classifier retries common timeout, connection, rate-limit, and server failures while excluding aborts.

## 3. Configure extraction retries separately

```ts
const data = await extract({
  model,
  text: sourceText,
  outputSchema,
  retries: {
    maxAttempts: 2,
  },
})
```

Extraction retry policy belongs to that extraction call. Use `shouldRetry` when invalid model output and infrastructure failure need different treatment.

## 4. Make writes idempotent

Derive a key from stable product and operation identity:

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

A later attempt can then return or update the existing operation instead of applying the write twice.

## 5. Keep job retry state outside prompts

The runner or queue owns attempt count, delay, backoff, and terminal status. Treat validation and authorization failures as terminal. Bound transient retries and preserve the same operation-level idempotency keys across attempts.

A retry executes work again. Inspecting a stored result or trace does not. Keep those product operations distinct.

Next, review the [production checklist](/sdk/advanced/parallel-and-batch/checklist).
