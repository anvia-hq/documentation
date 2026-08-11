# Parallel branches

Use `.parallel(...)` when multiple operations can start from the same current pipeline value without consuming one another's output.

## Build independent branches

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const ticketSchema = z.object({
  subject: z.string(),
  body: z.string(),
})

const classifyTicket = new PipelineBuilder(ticketSchema)
  .step(async (ticket) =>
    classifier.classify(`${ticket.subject}\n${ticket.body}`),
  )
  .build()

const detectPolicyRisk = new PipelineBuilder(ticketSchema)
  .step(async (ticket) => policyService.review(ticket.body))
  .build()

const loadCustomerImpact = new PipelineBuilder(ticketSchema)
  .step(async (ticket) => impactService.fromTicket(ticket))
  .build()

const triage = new PipelineBuilder(ticketSchema)
  .parallel(
    {
      classification: classifyTicket,
      policy: detectPolicyRisk,
      impact: loadCustomerImpact,
    },
    { name: 'Collect triage signals' },
  )
  .step(({ classification, policy, impact }) => ({
    route: classification.route,
    requiresReview: policy.requiresReview,
    priority: impact.priority,
  }))
  .build()
```

The branch names define both the result object and the labels visible during graph inspection. Use names that describe the returned evidence rather than implementation details.

## Understand the data flow

```text
validated ticket
   ├─ classification ─┐
   ├─ policy ─────────┼─ { classification, policy, impact }
   └─ impact ─────────┘
```

Each branch is a `PipelineOp`, so it may be another pipeline or a custom object with a compatible `run(input)` method. TypeScript infers the joined output from the branch map.

## Keep dependencies linear

If policy review requires the classification result, those operations are not independent:

```ts
const dependentFlow = new PipelineBuilder(ticketSchema)
  .use(classifyTicket)
  .step(async (classification) =>
    policyService.reviewClassification(classification),
  )
  .build()
```

Making dependent work parallel usually leads to duplicate reads, missing context, or a second reconciliation layer.

## Be careful with writes

Parallel branches are best for read-only lookups, analysis, classification, and independent generation. Avoid placing several product writes in branches unless the service methods are idempotent and concurrency-safe.

If one branch fails, the parallel stage fails. Other branches may already have started work, so a failed stage does not roll back external effects. Gather evidence in parallel, then perform controlled writes in a later linear step.

## Avoid shared mutation

Return branch results instead of mutating a shared object. Shared mutable state makes completion order observable and can introduce races that disappear when the pipeline runs sequentially.
