# Approval behavior

The Tools view reports approval metadata, but approvals are resolved in the Playground. Keeping those responsibilities separate prevents a dangerous assumption: an approval badge in the registry does not make direct invocation safe.

## What the Tools registry can discover

When a tool declares an `approval` policy, Studio marks it **required**:

```ts
const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a customer refund.',
  input: z.object({
    orderId: z.string(),
    amount: z.number().positive(),
    reason: z.string(),
  }),
  output: z.object({
    refundId: z.string(),
    status: z.literal('issued'),
  }),
  approval: {
    when: ({ args }) => args.amount > 0,
    reason: ({ args }) =>
      `Review refund of $${args.amount} for order ${args.orderId}.`,
    rejectMessage: 'Refund request rejected in Anvia Studio.',
  },
  execute: issueRefundHandler,
})
```

The table can identify that an approval policy exists. A fixed string `reason` or `rejectMessage` can also be exposed as metadata. A function-valued reason depends on real arguments and run context, so Studio evaluates and displays it only when the agent actually requests approval during a Playground run.

The badge means **this tool has approval policy**, not **every possible call will pause**. The policy's `when(...)` function decides that at runtime.

## Registry, runner, and Playground

| Surface | Purpose | Approval behavior |
| --- | --- | --- |
| Tools registry | Inspect definitions and policy metadata. | Shows `required` when a tool declares a policy. |
| Tools runner | Invoke a chosen handler with manual arguments. | Executes directly; it does not create an approval request. |
| Playground | Run the agent through its prompt lifecycle. | Pauses a guarded call and presents **Approve** and **Reject**. |

The direct runner bypasses both declarative tool approval and hook-requested approval. Never use it as evidence that an approval policy is correctly enforced. It is also capable of performing the underlying side effect immediately.

## Hook approvals are runtime behavior

A hook can request approval for a tool that has no declarative `approval` property:

```ts
const approvalHook = createHook({
  onToolCall({ toolName, args, tool }) {
    if (toolName === 'cancel_order') {
      return tool.requestApproval({
        reason: `Review order cancellation request: ${args}`,
        rejectMessage: 'Order cancellation rejected in Anvia Studio.',
      })
    }

    return tool.run()
  },
})

const agent = new Agent({
  id: 'support-operations',
  model: model,
  hook: approvalHook,
  tools: [getOrder, cancelOrder],
})
```

Because the policy lives in the hook, the Tools registry may show **none** for `cancel_order`. During a Playground run, the hook still pauses the call and Studio renders the request. Test hook policy through the Playground, not by reading the registry badge.

## What happens in the Playground

For a guarded agent tool call, Studio records the run, agent, tool, raw arguments, request time, and approval reason. Execution waits until the operator responds:

- **Approve** resumes the same tool call and lets the handler execute.
- **Reject** resolves the tool call as denied, using the operator reason or configured rejection message.
- stopping the run changes a pending approval to `cancelled` and resolves it as denied.

A resolved approval cannot be decided twice. These requests live inside the Studio process and are intended for development workflows, not as a durable production approval queue.

## Test both layers

Use a two-part check for guarded tools:

1. In **Tools**, run safe inputs against a development dependency to validate the input/output contract and handler behavior.
2. In **Playground**, prompt the agent to propose the guarded action, verify the generated reason and arguments, then exercise both approval and rejection.

This separates handler debugging from orchestration testing without confusing one for the other. See [Approvals and questions](/studio/playground/approvals-and-questions) for the complete interactive flow, or return to the [Tools overview](/studio/tools).
