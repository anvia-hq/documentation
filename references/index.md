# References

Quick reference for the core runtime surfaces used throughout these guides.

## Completion functions

- `createCompletion(model, request)` returns normalized `text`, `content`, `usage`, and `response`.
- `createCompletionStream(model, request)` yields normalized provider completion events such as `text_delta`.
- `createParsedCompletion(model, { schema, input })` returns schema-validated `data` or throws.

## Agent builder

```ts
new AgentBuilder(id, model)
  .name(name)
  .description(description)
  .instructions(instructions)
  .tools(tools)
  .context(document, id)
  .memory(store, options)
  .observe(observer)
  .defaultMaxTurns(turns)
  .build()
```

Use only the methods required by the agent.

## Prompt execution

- `agent.prompt(input).send()` returns final `output`, `usage`, `messages`, and optional `trace`.
- `agent.prompt(input).maxTurns(n).send()` overrides the turn limit for one request.
- `agent.prompt(input).stream()` yields runtime events.
- `agent.session(sessionId, scope)` creates a durable session surface.

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
| `final` | Completed output, usage, messages, run id, and trace metadata. |
| `error` | The active run failed. |

## Server stream

```ts
createEventStream(events, { format: 'jsonl' | 'sse' })
```

JSONL is the default. React clients normally send `{ messages, stream: true, metadata? }`.

## External reference

For the complete published Basics sequence, see the [Anvia Basics documentation](https://anvia.dev/docs/basics/overview).
