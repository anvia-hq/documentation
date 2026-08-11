# Typed input

Start a pipeline with a Zod schema when untrusted input should be rejected before any stage runs.

## Define the input

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const TicketInput = z.object({
  customer: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
})

const normalizeTicket = new PipelineBuilder(TicketInput)
  .step((ticket) => ({
    customer: ticket.customer.trim(),
    subject: ticket.subject.trim(),
    body: ticket.body.trim().replace(/\s+/g, ' '),
  }))
  .build()
```

TypeScript infers the parsed schema type for the first stage. Invalid input throws `ZodError` before the step executes.

## Run the pipeline

```ts
const ticket = await normalizeTicket.run({
  customer: 'Acme Co.',
  subject: 'Checkout failure',
  body: 'Checkout   fails after payment authorization.',
})

console.log(ticket.subject)
```

The final value is inferred from the last stage. Keep transport validation in the route when it is route-specific; use the pipeline schema for the workflow contract every caller must satisfy.

## Add workflow metadata

```ts
const pipeline = new PipelineBuilder(TicketInput, {
  id: 'ticket_triage',
  name: 'Ticket triage',
  description: 'Normalize and route support tickets.',
})
  .step(normalizeTicketInput)
  .build()
```

Stable IDs and names make graph inspection and run events easier to understand.
