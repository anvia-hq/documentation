# Tool approval

**Type:** Pattern

## Outcome

Pause a guarded tool at its execution boundary and let trusted application code approve or reject
it. Use approval for consequential actions such as refunds, deletions, deployments, or outbound
messages—not for ordinary read-only lookups.

## Prerequisites

- A typed tool and an authenticated server-side approval surface
- `@anvia/core`, `@anvia/openai`, and `zod`
- A persistence plan if a human cannot decide synchronously

## Guard and handle the action

```ts
const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a refund in USD.',
  input: z.object({ orderId: z.string(), amount: z.number().positive() }),
  output: z.object({ refundId: z.string(), status: z.literal('issued') }),
  approval: {
    when: ({ args }) => args.amount > 0,
    reason: ({ args }) => `Review $${args.amount} refund for ${args.orderId}.`,
    rejectMessage: 'The refund was not approved.',
  },
  execute: async ({ orderId, amount }) => refundService.issue({ orderId, amount }),
})

const request = agent.prompt('Refund $25 for order A-100.')

const response = await request
  .approvals({
    async handler(approval) {
      return approvalService.decide({
        actorId: authenticatedReviewer.id,
        toolName: approval.toolName,
        args: approval.args,
        reason: approval.reason,
      })
    },
  })
  .send()
```

`refundService`, `approvalService`, and `authenticatedReviewer` are application boundaries. The
handler returns `true`, `false`, or a structured approval decision.

## Run and expected behavior

When the model requests a positive refund, Anvia calls the approval handler before `execute`. An
approval runs the tool; a rejection skips execution and gives the model the configured rejection
message. With no handler, a guarded request throws `ToolApprovalRequiredError` rather than running.

## Boundaries

Approval is not authentication. Bind the decision to the exact actor, tenant, tool, normalized
arguments, and request identity; expire stale decisions; and make the action idempotent. Do not let
the model fabricate the reviewer or approval result. A synchronous handler is suitable only when
the decision is immediately available.

For durable human review, use Studio or persist a pending run and resume it through an audited
workflow. Revalidate resource state immediately before executing an approved action.

## Source and extensions

See the runnable
[Studio approval example](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/09_studio/03-tool-approval.ts)
and [permission hook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/08-tool-permission-hook.ts).
Next, add two-person approval or amount-based risk tiers.

- [Studio approvals](/studio/tools/approval-behavior)
- [Tool security](/sdk/tools/security)
