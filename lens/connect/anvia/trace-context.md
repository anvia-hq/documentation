# Trace context

Tracing configuration describes the process. Trace context describes one agent request. Add it through the run's `trace` option.

```ts
const response = await supportAgent.generate({
    prompt: 'Summarize ticket TICKET-1001 for engineering.',
    trace: {
        name: 'support-ticket-summary',
        userId: 'user_42',
        sessionId: 'ticket_1001',
        tags: ['support', 'summary'],
        version: 'prompt-v3',
        metadata: {
            ticketId: 'TICKET-1001',
            team: 'checkout',
            channel: 'dashboard',
        },
    }
})
```

This context travels with the run and makes the same request discoverable through the trace, session, and user views.

## Context fields

| Field | Use it for | Example |
| --- | --- | --- |
| `name` | A stable workflow name | `support-ticket-summary` |
| `userId` | The application user responsible for the request | `user_42` |
| `sessionId` | A conversation, ticket, workflow, or other related sequence | `ticket_1001` |
| `tags` | Low-cardinality filters shared across workflows | `support`, `summary` |
| `version` | The prompt or workflow version used by this request | `prompt-v3` |
| `metadata` | Small structured investigation context | team, channel, feature flag |
| `traceId` | An existing valid trace id when explicit trace correlation is required | 32-character hexadecimal id |
| `failOnObserverError` | Make observer failures fail this request | `true` in a telemetry contract test |
| `promptRef` | A named and optionally versioned prompt reference | `{ name: 'support-summary', version: 3 }` |

Most applications should set `name`, then add `userId` and `sessionId` when those concepts exist in the product.

## Model users and sessions from product identity

Use durable application identifiers—not display names or email addresses:

```ts
async function reply(input: {
  message: string
  accountId: string
  conversationId: string
}) {
  return supportAgent.generate({
      prompt: input.message,
      trace: {
          name: 'support-chat',
          userId: input.accountId,
          sessionId: input.conversationId,
      }
  })
}
```

`userId` lets Lens aggregate activity for one product identity. `sessionId` groups multiple agent requests into the same conversation or workflow. Reuse the same session id across turns; create a new id when the product starts a new session.

If an agent configured with memory uses an Anvia session, keep its id aligned with the trace context:

```ts
const session = { sessionId: conversation.id, userId: account.id };
const response = await agentWithMemory.generate({
    prompt: message,
    trace: {
        name: 'support-chat',
        userId: account.id,
        sessionId: conversation.id,
    },
    session: session
});
```

Session memory and Lens sessions serve different purposes: memory supplies context to future prompts, while Lens groups telemetry for investigation.

## Keep context useful and safe

Trace metadata is searchable operational data. Prefer:

- Internal ids that operators can correlate with application logs.
- Workflow names, channels, locale, tenant ids when permitted, and feature-flag variants.
- Small scalar values rather than full objects.
- Stable tag names with a controlled vocabulary.

Do not put access tokens, secrets, raw documents, full customer records, or unrestricted user text in tags or metadata. Safe capture controls prompt and response bodies; it does not make intentionally supplied trace context private.

## Record the returned identity

Anvia returns the trace identity with the response:

```ts
const response = await supportAgent.generate({
    prompt: message,
    trace: { name: 'support-chat', sessionId: conversation.id }
})

if (response.status === 'completed') {
  applicationLogger.info({
    traceId: response.trace?.traceId,
    observationId: response.trace?.observationId,
    conversationId: conversation.id,
  })
}
```

Recording the ids in application logs creates a reliable bridge from a product incident to its Lens trace.

## When observer failure should fail the run

Observer errors are normally isolated from the product request. That is the safer production behavior because a temporary telemetry problem should not take down the agent.

Use strict behavior only when observer callbacks are part of the job contract, such as an integration test:

```ts
const strictAgent = new Agent({
  id: 'observability-smoke-test',
  model,
  observability: {
    observers: { lens: lens.observer() },
    errorPolicy: 'throw',
  },
})

await strictAgent.generate({
  prompt: 'Run the observability smoke test.',
  trace: { name: 'observability-smoke-test' },
})
```

`observability.errorPolicy: 'throw'` surfaces observer callback failures during the run. It does not prove that the asynchronous OTLP exporter delivered the batch to Lens; use `flush()` for that boundary.

Continue to [Capture and privacy](/lens/connect/anvia/capture-and-privacy) before enabling request or response bodies.
