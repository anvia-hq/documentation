# Agents and extractors

Use `.agent()` when a stage needs model reasoning. Use `.extract()` when existing text must become Zod-validated fields.

## 1. Add an agent stage

```ts
const supportSummary = new Pipeline({
  id: 'support-summary',
  inputSchema: TicketInput,
})
  .step({
    id: 'format-ticket',
    run: ({ input: ticket }) => [
      `Customer: ${ticket.customer}`,
      `Subject: ${ticket.subject}`,
      `Body: ${ticket.body}`,
    ].join('\n'),
  })
  .agent({
    id: 'summarize',
    agent: summaryAgent,
    suspension: 'reject',
    request: ({ input }) => ({
      prompt: `Write a concise internal support summary:\n\n${input}`,
    }),
  })
```

`.agent()` requires an explicit `request` mapper and returns the completed agent output. The stage requires `suspension: 'reject'` and rejects blocked or suspended child runs.

Pipeline agent stages cannot cross an interaction boundary. If the agent returns `suspended`, the pipeline cancels that child phase and rejects. Run interaction-capable agents outside the pipeline when a person or policy engine must continue them.

## 2. Add an extractor stage

```ts
import { z } from 'zod'

const Ticket = z.object({
  priority: z.enum(['low', 'normal', 'high']),
  category: z.enum(['billing', 'technical', 'account']),
})

const triagePipeline = new Pipeline({
  id: 'ticket-triage',
  inputSchema: TicketInput,
})
  .step({
    id: 'format-ticket',
    run: ({ input: ticket }) => `${ticket.subject}\n\n${ticket.body}`,
  })
  .agent({
    id: 'summarize',
    agent: summaryAgent,
    suspension: 'reject',
    request: ({ input }) => ({ prompt: input }),
  })
  .extract({
    id: 'extract-triage',
    model,
    outputSchema: Ticket,
    text: ({ input }) => input,
  })
  .step({
    id: 'choose-route',
    run: ({ input: ticket }) => ({
      ...ticket,
      route: ticket.priority === 'high' ? 'incident' : 'support',
    }),
  })
```

After `.extract()`, the next stage receives the schema's output type. The stage declares its model, text mapper, schema, and optional extraction controls explicitly.

## 3. Keep responsibilities separate

The agent owns model reasoning. The extractor owns conversion from text into validated fields. Deterministic steps own authorization, product state, side effects, and final response mapping.

Next, learn how to [compose reusable pipelines](/sdk/pipelines/composition).
