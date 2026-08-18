# Approvals and questions

Studio can suspend an agent phase when a tool needs authorization or missing human context. The request appears inline in the Playground transcript, and the operator response starts a new linked phase from the server-held continuation.

Use the two controls for different decisions:

| Control | Use it when | Result returned to the agent |
| --- | --- | --- |
| Approval | The proposed tool call is already complete, but execution needs permission. | Approved execution output, or the configured rejection message. |
| Question | The agent cannot construct the next action without human input. | Structured answers from the operator. |

## Require approval on a tool

Add `requiresApproval` to a tool when its execution changes data, sends a message, spends money, or performs another action an operator should review:

```ts
import { createTool } from '@anvia/core/tool'
import { z } from 'zod'

const issueRefund = createTool({
  name: 'issue_refund',
  description: 'Issue a customer refund.',
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number().positive(),
    reason: z.string(),
  }),
  outputSchema: z.object({
    refundId: z.string(),
    status: z.literal('issued'),
  }),
  requiresApproval: ({ orderId, amount }) =>
    amount > 0
      ? { reason: `Review refund of $${amount} for order ${orderId}.` }
      : false,
  execute: ({ orderId }) => ({
    refundId: `rf_${orderId.toLowerCase()}`,
    status: 'issued' as const,
  }),
})
```

When the agent calls `issue_refund`, Studio streams the proposed tool arguments and approval reason into the transcript. The tool does not enter `execute` until the operator selects **Approve**.

Selecting **Reject** resumes the agent with a denied result and records the operator reason, allowing the agent to explain that the action was denied or choose a safer alternative.

## Ask the operator a question

Create a first-class question tool so the model can request one or more structured answers in a single interaction:

```ts
import { createQuestionTool } from '@anvia/core/tool'

const askQuestion = createQuestionTool({
  name: 'ask_question',
  description: 'Ask the operator for missing details before continuing.',
})
```

Question tools do not have an ordinary execution fallback. Core suspends with a `tool-question` interaction, Studio displays it, and the submitted answers enter the next linked agent phase as a tool response.

Each question must include:

- a stable, non-empty `id`;
- non-empty `text`;
- optional `{ label, value }` choices; and
- optional `allowCustom` when declared choices should also accept free text.

The operator may select a declared choice or enter a custom answer. For multiple questions, Studio presents them in sequence and enables submission only after every question has an answer.

## Guide the agent after human input

Register `ask_question` alongside the tool that consumes the confirmed values:

```ts
const agent = new Agent({
  id: 'support-escalation',
  model: model,
  instructions: [
    'Ask for priority, channel, and an operator note when they are missing.',
    'Ask all missing questions in one ask_question call.',
    'After the operator answers, call prepare_escalation with the confirmed values.',
  ].join('\n'),
  maxTurns: 5,
  tools: [askQuestion, prepareEscalation],
})

new Studio([agent], {
  quickPrompts: {
    'support-escalation': [
      'Prepare an escalation for Delta Kit Labs. Ask me for the missing details.',
    ],
  },
}).start()
```

Allow enough turns for the question response and follow-up action. Human answers continue the suspended tool call in a linked phase; they do not create a new user chat message.

## Cancellation and failure behavior

If the operator stops the run while it is waiting:

- a pending approval becomes `cancelled` and resolves as denied;
- a pending question becomes `cancelled` and resolves with no answers;
- the session transcript records the cancelled state.

Approval and question requests live in the Studio process. Restarting an in-memory Studio runtime does not preserve an unresolved interaction, so do not use the development Playground as a production approval queue.

Return to the [Playground overview](/studio/playground) or review [Run an agent](/studio/playground/run-an-agent) for the complete streaming lifecycle.
