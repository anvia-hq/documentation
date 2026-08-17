# Parallel branches

Use `.parallel()` when several operations can start from the same current value without consuming one another's output.

## 1. Build independent operations

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const ticketSchema = z.object({
    subject: z.string(),
    body: z.string(),
});
const classifyTicket = new Pipeline({
    id: 'classify-ticket',
    inputSchema: ticketSchema,
}).step({
    id: "step-1",
    run: ({ input: ticket }) => classifier.classify(`${ticket.subject}\n${ticket.body}`)
});
const detectPolicyRisk = new Pipeline({
    id: 'detect-policy-risk',
    inputSchema: ticketSchema,
}).step({
    id: "step-2",
    run: ({ input: ticket }) => policyService.review(ticket.body)
});
const loadCustomerImpact = new Pipeline({
    id: 'load-customer-impact',
    inputSchema: ticketSchema,
}).step({
    id: "step-3",
    run: ({ input: ticket }) => impactService.fromTicket(ticket)
});
const triage = new Pipeline({
    id: 'ticket-triage',
    inputSchema: ticketSchema,
})
    .parallel({
    id: "parallel-1",
    name: 'Collect triage signals',
    branches: {
        classification: classifyTicket,
        policy: detectPolicyRisk,
        impact: loadCustomerImpact,
    }
})
    .step({
    id: "step-4",
    run: ({ input: input }) => (({ classification, policy, impact }) => ({
        route: classification.route,
        requiresReview: policy.requiresReview,
        priority: impact.priority,
    }))(input)
});

```

Every branch is a `Pipeline` with a compatible input schema. TypeScript infers the joined output from the branch map.

## 2. Understand the data flow

```text
validated ticket
  |- classification --\
  |- policy ------------ { classification, policy, impact }
  `- impact -----------/
```

The branch keys label graph nodes and define the output object's keys. Choose names that describe the returned evidence.

## 3. Keep dependencies linear

If policy review requires classification, those stages are not independent:

```ts
const dependentFlow = new Pipeline({
    id: 'dependent-triage',
    inputSchema: ticketSchema,
}).compose({
    id: "compose-1",
    pipeline: classifyTicket
})
    .step({
    id: "step-1",
    run: ({ input: classification }) => policyService.reviewClassification(classification)
});

```

Keep true data dependencies in sequence. False parallelism causes duplicate reads, missing context, or an extra reconciliation stage.

## 4. Treat failures as partial execution

The branch implementations start together with `Promise.all()`. If one rejects, the parallel stage rejects, but already-started branches are not cancelled or rolled back.

Prefer parallel reads, classification, and independent analysis. Place controlled writes in a later linear step, or make every branch write idempotent and concurrency-safe.

## 5. Avoid shared mutation

Return branch results instead of mutating a shared object. Shared state makes completion order observable and introduces races that may disappear during sequential testing.

Next, process collections with [batch runs](/sdk/advanced/parallel-and-batch/batch).
