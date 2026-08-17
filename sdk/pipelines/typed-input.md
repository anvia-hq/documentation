# Typed input

Every pipeline starts with a Zod schema. The schema validates untrusted input before the first stage and determines the type received by that stage.

## 1. Define the workflow contract

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const TicketInput = z.object({
    customer: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
});
const normalizeTicket = new Pipeline({
    id: 'normalize-ticket',
    inputSchema: TicketInput,
})
    .step({
    id: "step-1",
    run: ({ input: ticket }) => ({
        customer: ticket.customer.trim(),
        subject: ticket.subject.trim(),
        body: ticket.body.trim().replace(/\s+/g, ' '),
    })
});

```

TypeScript infers the parsed schema type for `ticket`. Invalid input rejects `run()` with a `ZodError` before the step executes.

## 2. Run the pipeline

```ts
const ticket = await normalizeTicket.run({
    input: {
        customer: 'Acme Co.',
        subject: 'Checkout failure',
        body: 'Checkout fails after payment authorization.',
    }
});
console.log(ticket.subject);

```

The return type is inferred from the last stage. Keep route-specific transport validation in the route, and use the pipeline schema for the workflow contract every caller must satisfy.

## 3. Use schema transforms and defaults

The first stage receives the Zod output, which may differ from the accepted input:

```ts
const searchPipeline = new Pipeline({
    id: 'search',
    inputSchema: z.object({
        query: z.string().transform((value) => value.trim()),
        limit: z.number().int().positive().default(10),
    }),
})
    .step({
    id: "step-1",
    run: ({ input: input }) => (({ query, limit }) => searchIndex.query(query, limit))(input)
});

```

Parsing runs once for each pipeline execution.

## 4. Add workflow metadata

```ts
const pipeline = new Pipeline({
  id: 'ticket-triage',
  name: 'Ticket triage',
  description: 'Normalize and route support tickets.',
  metadata: { owner: 'support' },
  inputSchema: TicketInput,
})
```

The ID is required and must be non-empty. Names, descriptions, and JSON metadata appear in graph inspection and help operational tooling explain the workflow.

Next, add [pipeline steps](/sdk/pipelines/steps).
