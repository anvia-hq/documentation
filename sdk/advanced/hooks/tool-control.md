# Tool approval

Use `requiresApproval` on a tool when execution must pause for a person or external policy decision.

## 1. Protect every call

```ts
const deleteAccount = createTool({
  name: 'delete_account',
  description: 'Permanently delete an account.',
  inputSchema: z.object({ accountId: z.string() }),
  outputSchema: z.string(),
  requiresApproval: {
    reason: 'Deleting an account requires reviewer approval.',
  },
  async execute({ accountId }) {
    await accounts.delete(accountId)
    return 'Account deleted.'
  },
})
```

Use `requiresApproval: true` when no fixed reason is needed.

## 2. Require approval conditionally

The callback receives parsed tool input and trusted run context:

```ts
const requestRefund = createTool({
  name: 'request_refund',
  description: 'Request a refund for a settled charge.',
  inputSchema: z.object({
    chargeId: z.string(),
    amount: z.number().positive(),
  }),
  requiresApproval({ amount }, context) {
    if (amount <= 100) return false

    return {
      reason: `Review refund above the automatic limit for ${context.run.agentId}.`,
    }
  },
  async execute(input) {
    return refunds.request(input)
  },
})
```

Return `false` to run immediately, `true` to request approval, or `{ reason }` to request it with context. The input is parsed once and the same value is used after approval.

## 3. Resume a generated run

```ts
const pending = await agent.generate({
    prompt: message
})

if (pending.status === 'approval_required') {
  console.log(pending.approval.toolName)
  console.log(pending.approval.input)
  console.log(pending.approval.reason)

  const result = await agent.resume(pending, {
    approved: reviewer.approved,
    reason: reviewer.reason,
  })
}
```

A stream yields `approval_required` and ends that segment. Pass the exact pending event to `agent.resume()`; approval continuations are tied to the originating agent and in-memory pending object.

## 4. Keep authorization inside execution

Approval is orchestration, not the final security boundary. The tool handler must re-check current user, tenant, resource, and business permissions immediately before the side effect.

Approval may take time, so verify that the resource state and authorization are still valid when execution resumes.

Next, compare [lifecycle and middleware](/sdk/advanced/hooks/middleware).
