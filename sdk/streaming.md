# Streaming

Streaming exposes model or agent progress before the complete response is available. Anvia provides two levels:

```text
Completion stream: one provider request -> normalized provider events
Agent stream:      runtime turns -> tools -> final agent result
```

Use the lowest level that matches the workflow. A direct completion stream is simpler when one model call is enough. An agent stream is required when Anvia should execute local tools and continue the model loop.

## 1. Stream one completion

```ts
import { streamCompletion } from '@anvia/core'

const events = streamCompletion({
    prompt: 'Write a short launch note for Anvia.',
    model,
    instructions: 'Write clearly and concisely.'
})

for await (const event of events) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

Direct completion streams normalize provider output but do not execute local tool calls.

## 2. Stream an agent run

```ts
const events = agent.stream({
    prompt: 'Check the account and explain the current status.'
})

for await (const event of events) {
  if (event.type === 'tool_result') {
    console.log('Completed:', event.toolName)
  }

  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log('\nTokens:', event.result.usage.totalTokens)
  }
}
```

An agent stream covers the complete runtime loop and ends with a `final` result or a thrown failure. The final result can be completed, blocked, or suspended for an interaction.

## 3. Continue through the section

- [Completion streams](/sdk/streaming/completion-streams)
- [Agent streams](/sdk/streaming/agent-streams)
- [Event types](/sdk/streaming/event-types)
- [Server transport](/sdk/streaming/server-transport)
- [Errors and cancellation](/sdk/streaming/errors-and-cancellation)
- [Resumable streams](/sdk/streaming/resumable-streams)

Treat stream events as workflow state, not only text. Decide which progress, errors, usage, approvals, and tool activity belong in each product surface. Keep raw reasoning, tool arguments, tool results, and provider metadata off public transports unless they have been explicitly reviewed.
