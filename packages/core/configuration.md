# Configuration

Configure stable behavior on `Agent`, then add run-specific behavior on the `PromptRequest` it creates.

## Agent defaults

```ts
const agent = new Agent({
  id: 'support',
  model: model,
  name: 'Support agent',
  instructions: 'Use the account tools for account-specific answers.',
  temperature: 0.2,
  maxTokens: 800,
  maxTurns: 6,
  approvals: { handler: decideToolApproval },
  memory: { store: memoryStore, savePolicy: 'turn' },
  context: [{ id: 'refund-policy', text: 'Refunds are available for 30 days.' }],
  tools: [lookupAccount, createRefund],
  observers: [observer],
})
```

Agent configuration applies to every prompt from that agent. IDs should be stable because stores,
traces, Studio, and agent-as-tool relationships use them.

`additionalParams` is the provider-specific escape hatch. Keep it near provider composition code because another provider may not understand the same fields.

## Per-run controls

```ts
const request = agent
  .prompt('Refund order A123')
  .maxTurns(3)
  .withCompletionRetries({ maxAttempts: 3 })
  .withToolConcurrency(2)
  .withTrace({ sessionId: 'session_42', userId: 'user_7' })

const response = await request.send()
```

Request methods override or extend behavior for one run: turn count, transient completion retries, hook, approvals, guardrails, tool concurrency, middleware, and trace context. A prompt request is one-shot; create another request for another execution.

## Sessions and persistence

```ts
const session = agent.session('session_42', {
  userId: 'user_7',
})

await session.prompt('Remember that my plan is Pro.').send()
await session.prompt('Which plan am I using?').send()
```

A session requires an agent memory store to persist across application requests. The session ID selects a memory scope; it is not authorization. Verify that the authenticated caller owns the user and session before running the prompt.

See [runtime lifecycle](/packages/core/runtime-lifecycle), [memory configuration](/sdk/memory/configure), and [tool security](/sdk/tools/security).
