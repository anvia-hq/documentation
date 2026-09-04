# Agent streams

An agent stream handle exposes the complete runtime loop plus convenient projections for visible
text and the terminal outcome.

## 1. Stream a stateless run

```ts
const stream = agent.stream({
    prompt: 'Has the latest invoice been paid?'
})

for await (const event of stream.events) {
  switch (event.type) {
    case 'text_delta':
      process.stdout.write(event.delta)
      break

    case 'tool_call':
      console.log('\nTool:', event.toolCall.toolName)
      break

    case 'tool_result':
      console.log('Completed:', event.toolName)
      break

    case 'response':
      console.log('\nRun:', event.runId)
      console.log('Output:', event.output)
      console.log('Tokens:', event.usage.totalTokens)
      break

    case 'interaction':
      console.log('\nInteraction:', event.interaction)
      break

    case 'blocked':
      console.log('\nBlocked:', event.reason)
      break
  }
}
```

The final emitted item is the same `response | interaction | blocked` outcome returned by
`generate()`. It carries run ID, cumulative usage, messages, and optional context usage, trace,
guardrail decisions, sources, provider tool calls, or memory-compaction details.

## 2. Choose the smallest stream surface

Every `AgentStream` has one iterable consumer. Choose one iterable surface per run:

```ts
const stream = agent.stream({ prompt: 'Draft the incident update.' })

for await (const delta of stream.textStream) {
  process.stdout.write(delta)
}

const outcome = await stream.result
if (outcome.type === 'response') console.log(outcome.output)
```

- Iterate `stream` or `stream.events` for complete runtime events.
- Iterate `stream.textStream` for visible text deltas only.
- Await `stream.text` for collected visible text.
- Await `stream.result` for the terminal outcome without manually draining events, or after the
  chosen iterator finishes.

Awaiting `text` or `result` starts an internal drain when no iterator is active. Do not start a
second iterator on the same handle; the final promises remain safe to await after iteration.

## 3. Stream through a memory session

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

## 4. Treat tool-call deltas as provisional

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

## 5. Handle nested agent events

When an agent is exposed as a tool with `asTool({ stream: true })`, its child events are wrapped in `agent_tool_event` on the parent stream.

Internal operator views may inspect the nested event. Public interfaces should usually collapse it to a safe status such as “Checking specialist guidance.”

## 6. Steer an active stream

An `AgentStream` also exposes `steer(input)`. Accepted input receives a stable queued receipt; an
invalid or closed-run steer throws:

```ts
const stream = agent.stream({
    prompt: 'Draft the incident update.'
})

const receipt = stream.steer({
  prompt: 'Also mention that mitigation is already in progress.',
})

console.log(receipt.id, receipt.status) // queued
```

The stream emits `steering_applied` with the same ID when that input enters a later turn. Steering
does not replace cancellation or tool approval.

Next, review the complete [event types](/sdk/streaming/event-types).
