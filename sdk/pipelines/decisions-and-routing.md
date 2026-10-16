# Decisions and routing

Use `.decide()` when a stage needs a bounded judgment: a label, a score, or a probability. Use `.route()` when that judgment chooses which branch runs next. Both stages call [typed decisions](/sdk/decisions), so answers are validated before the next stage receives them.

```text
Input -> department (route) ─ billing   -> open-refund-case  ─┐
                            └ technical -> open-incident     ─┴-> Output
```

Pass a decision model from any adapter, such as [`@anvia/jev`](/sdk/providers/jev) or [OpenAI decisions](/packages/openai/decisions).

## 1. Add a decision stage

`.decide()` maps the current value to decision `state`, asks the questions, and returns the `DecisionResult` from [`decide()`](/sdk/decisions/answers). The next stage receives typed `answers`, optional `usage`, and the provider's `rawResponse`:

```ts
import { check, score } from '@anvia/core/decision'

const assessTicket = new Pipeline({ id: 'assess-ticket', inputSchema: TicketInput })
  .decide({
    id: 'assess',
    model,
    state: ({ input: ticket }) => ({ subject: ticket.subject, body: ticket.body }),
    questions: {
      urgent: check({ instructions: 'Does this ticket need a response within one hour?' }),
      severity: score({
        instructions: 'How severe is the customer impact?',
        rubric: ['Minor', 'Degraded', 'Blocked'],
      }),
    },
  })
  .step({
    id: 'set-priority',
    run: ({ input: { answers } }) => ({
      page: answers.urgent.probability >= 0.8 || answers.severity.score >= 1.5,
      severity: answers.severity.score,
    }),
  })
```

Thresholds stay in TypeScript. A probability or score is an estimate, so the step that reads it decides what counts as urgent.

## 2. Route to one branch

`.route()` asks one `choice` question and runs only the branch pipeline keyed by the selected option:

```ts anvia-check pipeline-route-example
import { Pipeline } from '@anvia/core/pipeline'
import { choice, type DecisionModel } from '@anvia/core/decision'
import { z } from 'zod'

const Ticket = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
})

const billing = new Pipeline({ id: 'billing-flow', inputSchema: Ticket }).step({
  id: 'open-refund-case',
  run: ({ input: ticket }) => ({ queue: 'billing', subject: ticket.subject }),
})

const technical = new Pipeline({ id: 'technical-flow', inputSchema: Ticket }).step({
  id: 'open-incident',
  run: ({ input: ticket }) => ({ queue: 'engineering', subject: ticket.subject }),
})

export function createTriage(model: DecisionModel) {
  return new Pipeline({ id: 'ticket-triage', inputSchema: Ticket }).route({
    id: 'department',
    model,
    state: ({ input: ticket }) => ({ subject: ticket.subject, body: ticket.body }),
    question: choice({
      instructions: 'Which team should handle this ticket?',
      options: {
        billing: 'Payments, invoices, and refunds',
        technical: 'Product bugs, outages, and errors',
      },
    }),
    branches: { billing, technical },
    retries: { maxAttempts: 2 },
  })
}
```

Every option needs exactly one branch, and every branch must be an option. A missing or extra branch is a TypeScript error and also throws a `TypeError` when the stage is added. The question is validated at the same point, so an invalid hand-written question fails before any run starts.

Each branch receives the same value the route stage received. Branch pipelines validate that value with their own `inputSchema`.

## 3. Read the route output

The route output is discriminated by `branch`:

```ts
const { output: routed } = await createTriage(model).run({
  input: { subject: 'Charged twice', body: 'My card was billed two times this month.' },
})

if (routed.branch === 'billing') {
  console.log(routed.output.queue) // typed as the billing pipeline's output
}
console.log(routed.answer.confidence) // provider-reported, when available
console.log(routed.usage) // usage of the routing decision, when reported
```

| Field | Meaning |
| --- | --- |
| `branch` | The selected option key. |
| `answer` | The validated `ChoiceAnswer`, including `probabilities` and `confidence` when the provider reports them. |
| `usage` | Token usage of the routing decision only. Omitted when the provider does not report it. |
| `output` | The selected branch pipeline's output. |

The exported `RouteOutput<Branches>` type describes this union.

## 4. Pass execution controls

Both stages accept `retries` and `providerOptions` with the same meaning as [`decide()` execution controls](/sdk/decisions/execution). Both receive the run's `abortSignal`, so cancelling the run cancels the decision call and the selected branch.

## 5. Handle failures

| Failure | Result |
| --- | --- |
| The provider returns a malformed answer or an unknown option | `DecisionProviderOutputError`; the stage fails and no branch runs. |
| The provider declines the question | `DecisionRefusalError`; the stage fails and no branch runs. |
| The model cannot answer the question type | `DecisionCapabilityError` before any provider call. |
| The selected branch throws | The branch's stage, the branch, and the route stage each emit `stage_failed`, then the run rejects with the branch error. |

See [Errors and validation](/sdk/decisions/errors) for the decision error contract and [Runs and errors](/sdk/pipelines/runs-and-errors) for run-level handling.

## 6. Inspect the graph

Decision stages appear as `decision` nodes. A route appears as a `route` node with one `branch` node per option. Edges from the route to its branches carry the option key as their `label`, and route branch nodes carry `branchOf: 'route'`. Parallel branch nodes carry `branchOf: 'parallel'`.

Only the selected branch emits stage events, so a run shows which path was taken. [Studio](/studio/pipelines/graph-and-inputs) logs decision stages, route stages, and route branches under the `decision` category.

## Choose the right stage

| Need | Use |
| --- | --- |
| A label, score, or probability to read in a later step | `.decide()` |
| One of several known flows, selected per input | `.route()` |
| Several independent flows on the same value | [`.parallel()`](/sdk/pipelines/parallel-and-batch) |
| Fields extracted from text under a schema | [`.extract()`](/sdk/pipelines/agents-and-extractors) |
| An open-ended choice of tools or next steps | [`.agent()`](/sdk/pipelines/agents-and-extractors) |
| A choice that depends only on known fields | A [`.step()`](/sdk/pipelines/steps) with ordinary TypeScript |

Next, learn how to [compose reusable pipelines](/sdk/pipelines/composition).
