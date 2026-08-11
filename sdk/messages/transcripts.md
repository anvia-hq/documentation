# Transcripts

A transcript is an ordered sequence of system, user, assistant, and tool messages. Preserve the complete sequence when later model calls need to understand what already happened.

## Continue a direct completion

```ts
const result = await createCompletion(model, {
  messages: previousMessages,
  input: 'Rewrite the last answer as three bullets.',
})
```

Direct completions accept history but do not persist it. The application owns `previousMessages` and decides what to append.

## Use an agent session

```ts
const response = await agent
  .session('thread_123', {
    userId: 'user_456',
    metadata: { tenantId: 'tenant_789' },
  })
  .prompt('Explain the last tool result.')
  .send()
```

With [memory](/sdk/memory), Anvia loads prior messages and appends new runtime messages according to the configured save policy.

## Preserve enough context

Store assistant tool calls and their tool results, not only visible assistant text. Keep message order, IDs, and strict-JSON metadata intact so providers, sessions, and UI adapters can rehydrate the same transcript.

Your application still owns retention, deletion, tenant checks, redaction, and audit policy. Conversation memory is not a substitute for product authorization.
