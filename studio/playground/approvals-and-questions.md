# Approvals and questions

Studio can pause an agent run when a tool needs authorization or missing human context. The request appears inline in the Playground transcript, and the same run resumes after the operator responds.

Use the two controls for different decisions:

| Control | Use it when | Result returned to the agent |
| --- | --- | --- |
| Approval | The proposed tool call is already complete, but execution needs permission. | Approved execution output, or the configured rejection message. |
| Question | The agent cannot construct the next action without human input. | Structured answers from the operator. |

## Require approval on a tool

Add `approval` to a tool when its execution changes data, sends a message, spends money, or performs another action an operator should review:

```ts
import { createTool } from '@anvia/core/tool'
import { z } from 'zod'

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
  execute: ({ orderId }) => ({
    refundId: `rf_${orderId.toLowerCase()}`,
    status: 'issued' as const,
  }),
})
```

When the agent calls `issue_refund`, Studio streams the proposed tool arguments and approval reason into the transcript. The tool does not enter `execute` until the operator selects **Approve**.

Selecting **Reject** resumes the agent with `rejectMessage`, allowing it to explain that the action was denied or choose a safer alternative. Treat that message as agent context, not as a guarantee that the model will use particular wording.

### Request approval from a hook

A hook is useful when the policy depends on the wider run or when several tools share one policy:

```ts
import { createHook } from '@anvia/core/hooks'

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
```

Attach the hook with `hook: approvalHook` when constructing the agent. Calls that do not require review must return `tool.run()` so they continue normally.

## Ask the operator a question

Studio recognizes a tool named `ask_question` as its human-question boundary. Give the tool a structured schema so the model can ask one or more questions in a single call:

```ts
import { createTool } from '@anvia/core/tool'
import { z } from 'zod'

const choiceSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const askQuestion = createTool({
  name: 'ask_question',
  description: 'Ask the operator follow-up questions. Always include choices.',
  input: z.object({
    questions: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        choices: z.array(choiceSchema).min(1),
      }),
    ),
  }),
  output: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
        choice: z.string().optional(),
        custom: z.boolean().optional(),
      }),
    ),
  }),
  execute: ({ questions }) => ({
    answers: questions.map((question) => ({
      questionId: question.id,
      answer: 'No human answer was provided by this runtime.',
    })),
  }),
})
```

The `execute` function is a fallback for runtimes that do not provide Studio’s interaction layer. During a Studio agent run, Studio intercepts `ask_question`, displays the questions in the Playground, waits for the operator, and returns the submitted answers to the agent instead of calling this fallback.

Each question must include:

- a stable, non-empty `id`;
- non-empty question text;
- at least one `{ label, value }` choice.

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

Allow enough turns for the question response and the follow-up action. Human answers resume the existing tool call; they do not start a new Playground message.

## Cancellation and failure behavior

If the operator stops the run while it is waiting:

- a pending approval becomes `cancelled` and resolves as denied;
- a pending question becomes `cancelled` and resolves with no answers;
- the session transcript records the cancelled state.

Approval and question requests live in the Studio process. Restarting an in-memory Studio runtime does not preserve an unresolved interaction, so do not use the development Playground as a production approval queue.

Return to the [Playground overview](/studio/playground) or review [Run an agent](/studio/playground/run-an-agent) for the complete streaming lifecycle.
