# Agents and extractors

Add an agent when a stage needs model reasoning. Add an extractor when the next stage needs validated fields from existing content.

## Prompt an agent

```ts
const supportSummary = new PipelineBuilder(TicketInput)
  .step((ticket) => [
    `Customer: ${ticket.customer}`,
    `Subject: ${ticket.subject}`,
    `Body: ${ticket.body}`,
  ].join('\n'))
  .step((text) =>
    `Write a concise internal support summary:\n\n${text}`,
  )
  .prompt(summaryAgent)
  .build()
```

`.prompt(agent)` converts the current value with `String(value)`. Format objects explicitly first; otherwise the model may receive `[object Object]`.

## Extract typed fields

```ts
const triagePipeline = new PipelineBuilder(TicketInput)
  .step((ticket) => `${ticket.subject}\n\n${ticket.body}`)
  .prompt(summaryAgent)
  .extract(ticketExtractor)
  .step((ticket) => ({
    ...ticket,
    route: ticket.priority === 'high' ? 'incident' : 'support',
  }))
  .build()
```

After `.extract(...)`, the next stage receives the extractor's schema type. Extractor retries and validation behavior remain configured on the [extractor](/sdk/structured-output/extractors).

## Keep boundaries clear

The agent owns reasoning. The extractor owns converting text into validated fields. Deterministic steps own authorization, product state, side effects, and final response mapping.
