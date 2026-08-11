# Agent streams

An agent stream covers the complete runtime loop: model turns, text, tools, nested agents, final output, usage, and errors.

## Consume a run

```ts
const request = agent
  .session('thread_123', { userId: 'user_456' })
  .prompt('Has my latest invoice been paid?')

for await (const event of request.stream()) {
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
      console.log('\nRun:', event.runId)
      console.log('Tokens:', event.usage.totalTokens)
      break
  }
}
```

The final event contains the completed output, cumulative usage, new runtime messages, run ID, and optional trace or provider artifacts.

## Tool-call deltas

`tool_call_delta` events are provisional. Argument fragments may be incomplete, and `argumentsMode: 'replace'` means the fragment is a full snapshot rather than an append.

Only the completed `tool_call` event is authoritative and executable. Tool-call deltas are enabled by default; disable them only for a strict legacy consumer:

```ts
for await (const event of request.stream({
  includeToolCallDeltas: false,
})) {
  // No tool_call_delta events.
}
```

## Nested agents

When an agent tool is created with `asTool({ stream: true })`, its child events appear inside `agent_tool_event`. Collapse those events to a simple status for user-facing interfaces unless users need to inspect the sub-agent workflow.
