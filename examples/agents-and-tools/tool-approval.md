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

## Resume the pending run

```ts
let result = await agent.generate({
    prompt: 'Refund $25 for order A-100.'
})

if (result.status === 'approval_required') {
  const decision = await approvalService.decide({
    reviewerId: authenticatedReviewer.id,
    toolName: result.approval.toolName,
    input: result.approval.input,
    reason: result.approval.reason,
  })

  result = await agent.resume(result, {
    approved: decision.approved,
    reason: decision.reason,
  })
}

if (result.status === 'completed') {
  console.log(result.output)
}
```

Pass the exact pending object back to the same agent. The continuation is tied to that in-memory run. A stream similarly yields an `approval_required` event and can be resumed with that event.

Approval is not authentication. Bind the decision to the actor, tenant, tool, normalized input, and request identity. Expire stale decisions, recheck authorization and resource state inside `execute`, and make the side effect idempotent.

For delayed human review, persist application state around the pending operation or use [Studio approval behavior](/studio/tools/approval-behavior).
