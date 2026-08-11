# Parallel and batch

Use parallel branches for independent work on one value. Use batch execution for many values through the same pipeline.

## Run independent branches

```ts
const classifyTopic = new PipelineBuilder(z.string())
  .step((text) => ({
    topic: text.includes('payment') ? 'billing' : 'operations',
  }))
  .build()

const detectUrgency = new PipelineBuilder(z.string())
  .step((text) => ({
    urgent: text.toLowerCase().includes('outage'),
  }))
  .build()

const analyzeTicket = new PipelineBuilder(z.string())
  .parallel({
    classification: classifyTopic,
    urgency: detectUrgency,
  })
  .step(({ classification, urgency }) => ({
    ...classification,
    ...urgency,
  }))
  .build()
```

Branch keys become output keys. Keep dependent work linear, and avoid parallel writes unless they are idempotent and conflict-safe.

## Process a batch

```ts
const normalizeTicket = new PipelineBuilder(z.string())
  .step((ticket) => ticket.trim().replace(/\s+/g, ' '))
  .build()

const normalized = await normalizeTicket.batch(
  [
    ' checkout   failed ',
    ' cannot update card ',
    ' password reset issue ',
  ],
  { concurrency: 2 },
)
```

Batch results preserve input order. Start concurrency low for provider calls and database work, then tune against real rate and connection limits.

`batch(...)` rejects when any input fails. Return an explicit `{ ok, value }` or `{ ok, error }` object inside the pipeline when the caller needs per-item status.
