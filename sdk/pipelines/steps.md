# Steps

Use `.step(...)` for normal application logic. Each step receives the previous output and defines the next inferred type.

## Add synchronous steps

```ts
const pipeline = new PipelineBuilder(TicketInput)
  .step((ticket) => ({
    ...ticket,
    wordCount: ticket.body.split(/\s+/).length,
  }))
  .step((ticket) => ({
    ...ticket,
    likelyUrgent: ticket.body.toLowerCase().includes('outage'),
  }))
  .build()
```

## Add asynchronous steps

```ts
const pipeline = new PipelineBuilder(TicketInput)
  .step(async (ticket) => {
    const customerTier = await customers.lookupTier(ticket.customer)
    return { ...ticket, customerTier }
  })
  .step(async (ticket) => {
    await auth.requireSupportAccess(ticket.customer)
    return ticket
  })
  .build()
```

Steps are the right place for normalization, permission checks, database reads, service calls, and final response shaping.

## Keep decisions explicit

Use ordinary TypeScript for conditional behavior:

```ts
.step((ticket) => ({
  ...ticket,
  route: ticket.likelyUrgent ? 'incident' : 'support',
}))
```

Do not hide deterministic product decisions inside prompt text. A thrown step error stops the pipeline and rejects `run(...)`.
