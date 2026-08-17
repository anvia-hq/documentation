# Steps

Use `.step()` for normal application logic. Each step receives the previous output and determines the next pipeline output type.

## 1. Add synchronous transforms

```ts
const pipeline = new Pipeline({
    id: 'ticket-signals',
    inputSchema: TicketInput,
})
    .step({
    id: "step-1",
    run: ({ input: ticket }) => ({
        ...ticket,
        wordCount: ticket.body.split(/\s+/).length,
    })
})
    .step({
    id: "step-2",
    run: ({ input: ticket }) => ({
        ...ticket,
        likelyUrgent: ticket.body.toLowerCase().includes('outage'),
    })
});

```

The first step adds `wordCount`; the second step sees that new field in its inferred input type.

## 2. Add asynchronous work

```ts
const pipeline = new Pipeline({
    id: 'authorized-ticket',
    inputSchema: TicketInput,
})
    .step({
    id: "step-1",
    run: async ({ input: ticket }) => {
        await auth.requireSupportAccess(ticket.customer);
        return ticket;
    }
})
    .step({
    id: "step-2",
    run: async ({ input: ticket }) => {
        const customerTier = await customers.lookupTier(ticket.customer);
        return { ...ticket, customerTier };
    }
});

```

Steps may return a value or a promise. A thrown or rejected error stops the pipeline and rejects `run()`.

## 3. Keep deterministic decisions explicit

```ts
const routed = pipeline.step({
    id: "step-1",
    run: ({ input: ticket }) => ({
        ...ticket,
        route: ticket.likelyUrgent ? 'incident' : 'support',
    })
});

```

Use TypeScript for permission checks, database writes, known thresholds, and product routing. Reserve model stages for judgments that cannot be expressed reliably as normal code.

## 4. Name operationally important stages

```ts
const pipeline = new Pipeline({
    id: 'ticket-triage',
    inputSchema: TicketInput,
})
    .step({
    id: 'normalize',
    name: 'Normalize ticket',
    run: ({ input: input }) => normalizeTicketInput(input)
})
    .step({
    id: 'load-customer',
    name: 'Load customer',
    metadata: { owner: 'support-platform' },
    run: ({ input: input }) => loadCustomer(input)
});

```

Stage metadata appears in `pipeline.graph()` and observer events. Generated labels are enough for small internal transforms.

Next, add [agents and extractors](/sdk/pipelines/agents-and-extractors).
