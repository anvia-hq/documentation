# Per-run controls

Every agent run starts with `generate(input, options)` or `stream(input, options)`. Constructor options define stable behavior; run options control one execution.

## 1. Configure one generated response

```ts
const result = await supportAgent.generate({
    prompt: input.message,
    maxTurns: 3,
    toolConcurrency: 2,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
    },
    trace: {
        name: 'support-turn',
        userId: user.id,
        metadata: { ticketId: input.ticketId },
    }
})
```

Supported run options are:

- `maxTurns` for this run's loop limit;
- `retries` for opt-in completion retries within each turn;
- `toolConcurrency` for parallel local tool execution;
- `lifecycle` for callbacks added to the agent lifecycle;
- `guardrails` for additional run policies;
- `middlewares` for request-specific model and tool transformation; and
- `trace` for observer correlation and behavior.

Tool concurrency must be a positive safe integer. The runtime reduces it to one when approval-capable tools require serial execution.

## 2. Read the result union

`generate()` can complete or pause for tool approval:

```ts
if (result.status === 'completed') {
  console.log(result.output)
  console.log(result.runId)
  console.log(result.usage.totalTokens)
  console.log(result.messages)
  console.log(result.trace)
} else {
  console.log(result.approval.toolName)
  console.log(result.approval.input)
  console.log(result.approval.reason)
}
```

A completed result may also contain context usage, guardrail decisions, normalized sources, and provider-executed tool metadata.

## 3. Resume an approval

Pass the exact pending result back to the same agent with a decision:

```ts
let result = await supportAgent.generate({
    prompt: input.message
})

while (result.status === 'approval_required') {
  const approved = await requestHumanDecision(result.approval)

  result = await supportAgent.resume(result, {
    approved,
    reason: approved ? 'Approved by operator' : 'Rejected by operator',
  })
}

console.log(result.output)
```

Approval is a suspended result, not an exception. The continuation belongs to the agent and pending object that created it and can be resumed once.

## 4. Stream one run

```ts
const stream = supportAgent.stream({
    prompt: input.message,
    maxTurns: 3,
    toolConcurrency: 2,
    trace: { name: 'support-stream' }
})

for await (const event of stream) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'tool_result') {
    console.log(event.toolName, event.result)
  }

  if (event.type === 'final') {
    console.log(event.result.text, event.result.usage)
  }
}
```

Consumers that do not need partial tool arguments can ignore `tool_call_delta` and handle the complete `tool_call` event.

Use [server transport](/sdk/streaming/server-transport) to convert safe, selected events into an HTTP stream. Do not send raw reasoning, tool arguments, tool results, or provider metadata to browsers without an explicit data policy.

## 5. Run inside a memory session

When memory is configured, use the same run options on the session:

```ts
const sessionAgent = new Agent({
    id: 'support-session',
    model,
    instructions: 'Use conversation history when answering follow-up questions.',
    memory: { store: memoryStore },
});
const session = { sessionId: conversationId, userId: user.id, metadata: { tenantId: user.tenantId } };
const result = await sessionAgent.generate({
    prompt: input.message,
    maxTurns: 3,
    trace: { name: 'support-session-turn' },
    session: session
});
```

A session accepts a string or one normalized message. It loads its own history, so it does not accept a `Message[]` transcript.

Continue with [Runtime lifecycle](/sdk/agents/runtime-lifecycle).
