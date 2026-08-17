# Configuration

Configure stable behavior on `Agent`, then pass run-specific controls to `generate(...)` or `stream(...)`.

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
  memory: { store: memoryStore, savePolicy: 'turn' },
  context: [{ id: 'refund-policy', text: 'Refunds are available for 30 days.' }],
  tools: [lookupAccount, createRefund],
  observability: { observers: { observer } },
})
```

Agent configuration applies to every prompt from that agent. IDs should be stable because stores,
traces, Studio, and agent-as-tool relationships use them.

`providerOptions` is the provider-specific escape hatch. Keep it near provider composition code because another provider may not understand the same fields.

## Per-run controls

```ts
const response = await agent.generate({
    prompt: 'Refund order A123',
    maxTurns: 3,
    retries: { maxAttempts: 3 },
    toolConcurrency: 2,
    trace: { sessionId: 'session_42', userId: 'user_7' }
})
```

Run options override or extend behavior for one execution: turn count, transient completion retries, lifecycle callbacks, guardrails, tool concurrency, middleware, and trace context. Each call creates a fresh run.

## Sessions and persistence

```ts
const session = { sessionId: 'session_42', userId: 'user_7' };
await agent.generate({
    prompt: 'Remember that my plan is Pro.',
    session: session
});
await agent.generate({
    prompt: 'Which plan am I using?',
    session: session
});
```

A session requires an agent memory store to persist across application requests. The session ID selects a memory scope; it is not authorization. Verify that the authenticated caller owns the user and session before running the prompt.

See [runtime lifecycle](/packages/core/runtime-lifecycle), [memory configuration](/sdk/memory/configure), and [tool security](/sdk/tools/security).
