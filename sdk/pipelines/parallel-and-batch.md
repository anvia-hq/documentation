# Parallel and batch

Use `.parallel()` for independent work on one value. Use `.runBatch()` for many inputs through the same pipeline.

## 1. Run independent branches

Each branch is a `Pipeline` whose input schema accepts the current value:

```ts
const classifyTopic = new Pipeline({
    id: 'classify-topic',
    inputSchema: z.string(),
}).step({
    id: "step-1",
    run: ({ input: text }) => ({
        topic: text.includes('payment') ? 'billing' : 'operations',
    })
});
const detectUrgency = new Pipeline({
    id: 'detect-urgency',
    inputSchema: z.string(),
}).step({
    id: "step-2",
    run: ({ input: text }) => ({
        urgent: text.toLowerCase().includes('outage'),
    })
});
const analyzeTicket = new Pipeline({
    id: 'analyze-ticket',
    inputSchema: z.string(),
})
    .parallel({
    id: "parallel-1",
    branches: {
        classification: classifyTopic,
        urgency: detectUrgency,
    }
})
    .step({
    id: "step-3",
    run: ({ input: input }) => (({ classification, urgency }) => ({
        ...classification,
        ...urgency,
    }))(input)
});

```

Branches run concurrently with the same input. Their keys become the keys of the output object. Keep dependent work linear, and avoid parallel writes unless they are idempotent and conflict-safe.

If any branch rejects, the parallel stage rejects. Other already-started branches may still be running, so failure does not roll back their side effects.

## 2. Process a batch

```ts
const normalizeTicket = new Pipeline({
    id: 'normalize-ticket',
    inputSchema: z.string(),
}).step({
    id: "step-1",
    run: ({ input: ticket }) => ticket.trim().replace(/\s+/g, ' ')
});
const normalized = await normalizeTicket.runBatch({
    inputs: [
        ' checkout   failed ',
        ' cannot update card ',
        ' password reset issue ',
    ],
    concurrency: 2
});

```

Batch results preserve input order even when individual executions finish in a different order. Start concurrency low for provider calls and database work, then tune it against actual rate and connection limits.

`runBatch()` records each item independently as completed or failed. Inspect the settled union:

```ts
for (const item of normalized) {
  if (item.status === 'completed') console.log(item.output)
  else console.error(item.runId, item.error)
}
```

Next, learn about [runs and errors](/sdk/pipelines/runs-and-errors).
