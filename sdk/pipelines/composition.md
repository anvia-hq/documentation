# Composition

Use `.use(...)` to reuse another pipeline or any object implementing `PipelineOp`.

## Reuse a pipeline

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const cleanText = new PipelineBuilder(z.string())
  .step((text) => text.trim())
  .step((text) => text.replace(/\s+/g, ' '))
  .build()

const classifyNote = new PipelineBuilder(z.string())
  .use(cleanText)
  .step((text) => ({
    text,
    urgent: text.toLowerCase().includes('outage'),
  }))
  .build()
```

The nested pipeline's output becomes the next stage's input.

## Name important stages

```ts
const pipeline = new PipelineBuilder(TicketInput, {
  id: 'ticket_triage',
  name: 'Ticket triage',
})
  .step(normalizeTicketInput, { name: 'Normalize ticket' })
  .prompt(summaryAgent, { name: 'Summarize ticket' })
  .extract(ticketExtractor, { name: 'Extract triage fields' })
  .build()
```

Stage metadata appears in `pipeline.graph()` and run-observer events. Name stages that matter in operations; generated labels are enough for small internal transforms.

## Reuse behavior, not accidental complexity

Extract a nested pipeline when it has a meaningful contract or several callers. Keep a one-off transform as a normal `.step(...)`.
