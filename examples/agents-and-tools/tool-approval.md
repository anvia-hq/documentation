# Tool approval

`requiresApproval` pauses a guarded tool immediately before execution. Trusted application code can then approve or reject the exact pending call.

## Guard the action

```ts
const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a customer refund in USD.',
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number().positive(),
  }),
  outputSchema: z.object({
    refundId: z.string(),
    status: z.literal('issued'),
  }),
  requiresApproval: ({ orderId, amount }) => ({
    reason: `Review $${amount} refund for ${orderId}.`,
  }),
  async execute({ orderId, amount }) {
    await auth.requireRefundAccess(actor, orderId)
    return refundService.issue({ orderId, amount })
  },
})
```

Return `false` from the callback when a particular input may run automatically. Use `true` or `{ reason }` when it must pause.

## Continue the suspended run

```ts
let result = await agent.generate({
    prompt: 'Refund $25 for order A-100.'
})

if (result.status === 'suspended') {
  if (result.interaction.type !== 'tool-approval') {
    throw new Error(`Unexpected interaction: ${result.interaction.type}`)
  }
  const decision = await approvalService.decide({
    reviewerId: authenticatedReviewer.id,
    toolName: result.interaction.toolName,
    input: result.interaction.input,
    reason: result.interaction.reason,
  })

  result = await agent.generate({
    continuation: result.continuation,
    response: {
      type: 'tool-approval',
      approved: decision.approved,
      reason: decision.reason,
    },
  })
}

if (result.status === 'completed') {
  console.log(result.output)
}
```

Keep the JSON-safe continuation on the trusted server and pass it back to the same agent with a matching interaction response. The continued phase receives a new `runId` and links back through `resumedFrom`. A stream ends with a `final` event whose result has the same `suspended` shape; continue it with `agent.stream({ continuation, response })`.

Core validates the agent, interaction, tool registration, and response shape. It does not provide a durable continuation store or exactly-once execution, so the application must claim each interaction atomically and reject duplicate or expired decisions.

Approval is not authentication. Bind the decision to the actor, tenant, tool, normalized input, and request identity. Expire stale decisions, recheck authorization and resource state inside `execute`, and make the side effect idempotent.

For delayed human review, persist application state around the pending operation or use [Studio approval behavior](/studio/tools/approval-behavior).
