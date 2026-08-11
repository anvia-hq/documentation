# Per-run controls

Every call starts with `agent.prompt(...)`. Configure values that apply only to that run before choosing `send()` or `stream()`.

## Configure one request

```ts
const response = await agent
  .session(conversationId, { userId: user.id })
  .prompt(input.message)
  .withTrace({
    name: 'billing-chat',
    userId: user.id,
  })
  .withToolConcurrency(2)
  .maxTurns(4)
  .send()
```

Use request controls for trace metadata, one-off middleware, hooks, tool concurrency, approvals, and limits that are tighter than the agent defaults.

## Send or stream

| Method | Use it when |
| --- | --- |
| `.send()` | The application needs only the completed response. |
| `.stream()` | A UI, CLI, or worker needs progressive runtime events. |
| `.readableStream()` | An HTTP transport needs a web `ReadableStream`. |

See [Streaming](/sdk/streaming) before exposing agent events to a client.

## Read the response

```ts
console.log(response.output)
console.log(response.usage.totalTokens)
console.log(response.messages)
console.log(response.trace)
```

The response contains final visible output, usage accumulated across turns, messages created during the run, and optional trace metadata.

## Map failures at the runner

The runtime can fail because of provider errors, tool failures, cancellation, required approval, or a turn limit. Catch and translate those failures in the application runner; do not expose raw provider or tool errors directly to users.
