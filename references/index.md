# References

Quick reference for the core runtime surfaces used throughout these guides.

## Completion functions

- `generateCompletion({ model, prompt | messages, ...options })` returns normalized `output`, `text`, `content`, `usage`, and `rawResponse`.
- `streamCompletion({ model, prompt | messages, ...options })` yields normalized events such as `text_delta` and a final `result`.
- `generateCompletion({ model, prompt | messages, outputSchema, ...options })` returns schema-validated `output` or throws.

## Agent construction

```ts
new Agent({
  id: id,
  model: model,
  name: name,
  description: description,
  instructions: instructions,
  memory: { store: store, ...options },
  maxTurns: turns,
  context: [{ id: id, text: document }],
  tools: [...tools],
  observability: { observers: { observer } },
})
```

Pass only the options required by the agent. Construction returns a ready-to-use runtime.

## Agent execution

- `agent.generate({ prompt | messages, ...runOptions })` returns a completed, blocked, or suspended result.
- `agent.generate({ prompt, maxTurns: n })` overrides the turn limit for one run.
- `agent.stream({ prompt | messages, ...runOptions })` yields runtime events.
- `agent.generate({ continuation, response })` starts a linked phase after an approval or question.
- `agent.generate({ prompt, session: { sessionId, userId? } })` runs with persisted memory.

## Agent stream events

| Event | Meaning |
| --- | --- |
| `turn_start` | A model turn is starting. |
| `text_delta` | Incremental visible assistant text. |
| `reasoning_delta` | Incremental provider reasoning text, when available. |
| `tool_call` | The model requested an application tool. |
| `tool_result` | The application returned a tool result. |
| `turn_end` | A model turn completed. |
| `agent_tool_event` | A nested agent emitted an event while running as a tool. |
| `interaction_response` | A linked phase accepted an approval or question response. |
| `final` | Completed, blocked, or suspended result with usage, messages, and run metadata. |
| `error` | The active run failed. |

## Server stream

```ts
createClientStreamResponse({
  events: agentToClientStream({ events }),
  format: 'jsonl' | 'sse',
})
```

JSONL is the default. React clients send either a `messages` request or an `interaction_response` request through a `ClientTransport`.

## External reference

For the complete walkthrough, start with [Your first agent](/sdk/your-first-agent).
