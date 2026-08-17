# Agent streams

An agent stream exposes the complete runtime loop: turns, provider generation, tool calls, tool results, nested agents, final output, usage, approvals, and errors.

## 1. Stream a stateless run

```ts
const events = agent.stream({
    prompt: 'Has the latest invoice been paid?'
})

for await (const event of events) {
  switch (event.type) {
    case 'text_delta':
      process.stdout.write(event.delta)
      break

    case 'tool_call':
      console.log('\nTool:', event.toolCall.function.name)
      break

    case 'tool_result':
      console.log('Completed:', event.toolName)
      break

    case 'final':
      console.log('\nRun:', event.result.runId)
      console.log('Output:', event.result.status === 'completed' ? event.result.output : 'blocked')
      console.log('Tokens:', event.result.usage.totalTokens)
      break
  }
}
```

The `final` event contains a completed or blocked `result` with run ID, cumulative usage, messages, and optional context usage, trace, guardrail decisions, sources, or provider tool calls.

## 2. Stream through a memory session

Use the session directly when the agent has configured [memory](/sdk/memory):

```ts
const session = { sessionId: 'thread_123', userId: 'user_456' };
for await (const event of agent.stream({
    prompt: 'Has my latest invoice been paid?',
    session: session
})) {
    await handleEvent(event);
}
```

There is no intermediate prompt-request builder in v1. `agent.stream({ prompt, session })` returns the stream directly.

## 3. Treat tool-call deltas as provisional

`tool_call_delta` events may contain partial names or argument fragments. When `argumentsMode` is `replace`, `argumentsDelta` is a full current snapshot rather than text to append.

Only the completed `tool_call` event is authoritative. Anvia validates and executes the completed call, not the provisional fragments.

Consumers that only understand completed calls should ignore `tool_call_delta`:

```ts
for await (const event of agent.stream({
    prompt: input
})) {
  if (event.type === 'tool_call') handleCompleteToolCall(event)
}
```

## 4. Handle nested agent events

When an agent is exposed as a tool with `asTool({ stream: true })`, its child events are wrapped in `agent_tool_event` on the parent stream.

Internal operator views may inspect the nested event. Public interfaces should usually collapse it to a safe status such as “Checking specialist guidance.”

## 5. Steer an active stream

An `AgentStream` also exposes `steer(input)`. It returns `true` when the message was accepted for a later turn and `false` when the run can no longer accept steering:

```ts
const stream = agent.stream({
    prompt: 'Draft the incident update.'
})

const accepted = stream.steer(
  'Also mention that mitigation is already in progress.',
)
```

Steering does not replace cancellation or tool approval. Treat it as additional user input to the active run.

Next, review the complete [event types](/sdk/streaming/event-types).
