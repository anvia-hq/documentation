# Runs and errors

`run()` validates the input, executes stages in order, and resolves with the final output. Any validation or stage failure rejects the run.

## 1. Observe stage execution

Pass a pipeline observer to one run:

```ts
const result = await pipeline.run({
    input: input,
    observer: {
        async onEvent(event) {
            await workflowEvents.append({
                type: event.type,
                nodeId: event.node.id,
                nodeLabel: event.node.label,
                durationMs: 'durationMs' in event ? event.durationMs : undefined,
            });
        },
    }
});

```

Observers receive `stage_started`, `stage_completed`, and `stage_failed`. Completed and failed events include `durationMs`; failed events also include the error. An observer error rejects the run.

Pipeline observers describe workflow stages. Configure agent observers separately for model and tool activity inside an `.agent()` stage.

## 2. Inspect the graph

```ts
const pipeline = new Pipeline({
    id: 'ticket-triage',
    name: 'Ticket triage',
    inputSchema: z.string(),
})
    .step({
    id: 'normalize',
    name: 'Normalize ticket',
    run: ({ input: text }) => text.trim()
})
    .step({
    id: 'route',
    name: 'Route ticket',
    run: ({ input: text }) => ({ text, route: 'support' })
});
const graph = pipeline.graph();

```

The returned snapshot contains pipeline metadata, nodes, and edges. Node kinds include `input`, `step`, `pipeline`, `parallel`, `branch`, `agent`, `extractor`, and `output`.

The graph describes workflow structure, not a particular run's inputs, outputs, timing, or errors. Use observer events for runtime state.

## 3. Map failures at the runner

Input validation fails before the first stage. Later errors may come from steps, nested operations, parallel branches, agents, or extractors:

```ts
try {
    return await pipeline.run({
        input: input
    });
}
catch (error) {
    await workflowErrors.record(error);
    return { status: 'failed' };
}

```

Retry the narrow failing boundary when it is safe. Do not retry an entire pipeline after partial side effects unless those effects are idempotent, transactionally guarded, or keyed so repeats replace the same result.

For slow or durable work, run the pipeline in a [production worker](/sdk/pipelines/production-workers).
