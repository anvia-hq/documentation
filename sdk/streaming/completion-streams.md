# Completion streams

Use `streamCompletion()` when one direct model call should yield provider-neutral events as they arrive.

## 1. Stream visible text

The input is the first argument. The model and request controls belong in the second argument:

```ts
import { streamCompletion } from '@anvia/core'

const events = streamCompletion({
    prompt: 'Write a short launch note for Anvia.',
    model,
    instructions: 'Write clearly and concisely.',
    maxTokens: 300
})

let text = ''

for await (const event of events) {
  if (event.type === 'text_delta') {
    text += event.delta
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    console.log('\nTokens:', event.result.usage.totalTokens)
  }
}
```

The provider should finish with a `final` event containing the normalized `CompletionResponse`.

## 2. Handle more than text

A completion stream may emit:

- visible `text_delta` events;
- `reasoning_delta` events when the provider exposes reasoning content;
- provisional `tool_call_delta` and completed `tool_call` events;
- provider `source` and `provider_tool_call` records;
- a provider `message_id`;
- a `final` response; or
- an `error` with optional authoritative usage.

Tool calls are data at this level. `streamCompletion()` does not execute local tools or send their results back to the model. Use an [agent stream](/sdk/streaming/agent-streams) for that runtime loop.

## 3. Check capabilities before transport

The model must implement streaming and report `capabilities.streaming: true`. It must also support every optional request feature, such as tools, images, documents, reasoning, or an output schema.

Anvia checks capabilities before starting the provider request and throws `CompletionCapabilityError` for an incompatible request.

## 4. Retry only before progress is exposed

```ts
const events = streamCompletion({
    prompt: input,
    model,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
    }
})
```

A streaming provider call is retried only before a non-error event has been exposed. This prevents duplicated deltas after the caller has already rendered output.

Next, stream a full [agent run](/sdk/streaming/agent-streams).
