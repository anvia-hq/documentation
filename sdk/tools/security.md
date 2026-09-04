# Tool security

A tool crosses from model-generated intent into application code. Treat its handler as a product security boundary.

## Authorize every operation

The model can propose valid arguments for data it should not access. Check user and tenant permissions inside the handler before reading data or causing a side effect.

```ts
const requestRefund = createTool({
  name: 'request_refund',
  description: 'Create a refund request for an eligible order.',
  inputSchema: z.object({
    orderId: z.string(),
    amountCents: z.number().int().positive(),
    reason: z.string().min(1),
  }),
  async execute(args) {
    await auth.requireRefundPermission(user.id, args.orderId)
    await policy.assertRefundAllowed(args.orderId, args.amountCents)

    const refund = await refunds.createRequest({
      ...args,
      requestedBy: user.id,
    })

    await audit.record('refund.requested', {
      refundId: refund.id,
      orderId: args.orderId,
    })

    return `Refund request ${refund.id} was created.`
  },
})
```

## Protect side effects

Keep each action narrow. Make retried operations idempotent where possible, validate business rules immediately before execution, and record sensitive changes in an audit log.

Use [human approval](/studio/playground/approvals-and-questions) for high-risk side effects, but
never use approval as the only permission or policy check.

## Layer the enforcement points

`requiresApproval` on a tool declares when that tool must pause for approval. A run's `hooks.onToolCall` hook is a wider gate: it sees every tool call before a handler executes and can skip the call, terminate the run, or force an approval request. Middleware transforms input and output data but is not a policy gate, so keep authorization in the handler and use each layer for what it is for. See [middleware](/sdk/tools/middleware) and the [hooks overview](/sdk/advanced/hooks).

## Before shipping

- Keep the input schema narrow and documented.
- Enforce user and tenant permissions in the handler.
- Make side effects idempotent or audited.
- Map private service failures before returning them.
- Exclude internal fields and secrets from output.
- Test the handler without a provider call.
