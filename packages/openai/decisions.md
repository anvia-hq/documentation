# OpenAI decisions

`OpenAIClient.decisionModel()` supplies the provider-neutral `@anvia/core/decision` contract.
Use it for bounded classification, independent labels, rubric scores, and probability checks.
It calls the Decisions endpoint rather than completion or structured-output APIs.

```ts anvia-check openai-decision-example
import { OpenAIClient, GPT_6_LUNA } from '@anvia/openai'
import { choice, decide } from '@anvia/core/decision'

export async function routeTicket(client: OpenAIClient, message: string) {
  const result = await decide({
    model: client.decisionModel({ modelId: GPT_6_LUNA }),
    state: { message },
    questions: {
      department: choice({
        instructions: 'Which department should handle this ticket?',
        options: {
          billing: 'Payments, invoices, and refunds',
          technical: 'Product bugs and technical support',
          general: 'Other requests',
        },
      }),
    },
  })
  return result.answers.department
}
```

Create the client with server-side credentials or inject an initialized OpenAI SDK client. The
adapter requires OpenAI SDK 7.30.0 or newer. `GPT_6_LUNA` is the known decision-model constant;
`OpenAIDecisionModelId` also accepts extensible string IDs. A type or constant does not guarantee
model access for your account or a compatible endpoint.

## Mapping and limits

| Anvia question | Provider mapping | Boundary |
| --- | --- | --- |
| `choice` | Native choice | 2–255 options; provider confidence is preserved. |
| `score` | Native score levels | At most 10 rubric levels; mapped back to the Anvia score contract. |
| `check` | Native predicate | Preserves the provider probability. |
| `multiLabel` | One independent predicate per label | Composed support; labels are not a mutually exclusive distribution. |

Mixed question kinds are supported. The request limit is **200 provider questions after multi-label
expansion**, so one multi-label question with 20 labels consumes 20 slots. Invalid limits are rejected
before network work. Strings are sent verbatim; structured state and criteria are JSON-encoded text.

The adapter validates response identities, distributions, rubric labels, and token usage. It retains
the raw provider response. SDK retries are disabled per request; Core `decide()` / `decideBatch()`
own retry, cancellation, and ordered batch behavior. See [Execution](/sdk/decisions/execution).

## Refusals

If any provider question is refused, the entire decision throws `DecisionRefusalError`; it does not
return partial success or invent an answer. `questionNames` contains the original application keys,
including the parent multi-label key for a refused expanded predicate.

```ts
import { DecisionRefusalError } from '@anvia/core/decision'

try {
  const answer = await routeTicket(client, ticketText)
  routeToDepartment(answer.choice)
} catch (error) {
  if (!(error instanceof DecisionRefusalError)) throw error
  await requestHumanReview(error.questionNames)
}
```

The error also carries `provider`, `modelId`, and `rawResponse`. Keep raw responses within your
application's capture policy. See [Errors and validation](/sdk/decisions/errors).
