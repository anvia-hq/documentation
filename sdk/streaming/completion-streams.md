# Completion streams

Use `streamCompletion()` when one direct model call should yield provider-neutral events as they arrive.

## 1. Stream visible text

Pass the prompt or messages together with the model and request options:

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

The stream finishes with a `final` event whose `result` is the same `CompletionResult` returned by `generateCompletion()`.

## 2. Handle more than text

A completion stream may emit:

- visible `text_delta` events;
- `reasoning_delta` events when the provider exposes reasoning content;
- provisional `tool_call_delta` and completed `tool_call` events;
- provider `source` and `provider_tool_call` records;
- a provider `message_id`;
- a `final` event whose `result` is the completed `CompletionResult`; or
- an `error` with cumulative usage across provider attempts, empty when none was reported.

Tool calls are data at this level. `streamCompletion()` does not execute local tools or send their results back to the model. Use an [agent stream](/sdk/streaming/agent-streams) for that runtime loop.

## 3. Stream structured output

Pass `outputSchema` to stream validated typed output. The `final` event carries the parsed value on `event.result.output`:

```ts
import { streamCompletion } from '@anvia/core'
import { z } from 'zod'

const events = streamCompletion({
    prompt: 'Classify this support ticket.',
    model,
    outputSchema: z.object({
        queue: z.enum(['billing', 'technical', 'account']),
        priority: z.enum(['low', 'normal', 'high'])
    })
})

for await (const event of events) {
  if (event.type === 'final') {
    console.log(event.result.output.queue)
  }
}
```

If the provider output is truncated, filtered, unparseable, or fails schema validation, the stream yields an `error` event carrying a `CompletionStructuredOutputError` with a `phase` of `truncated`, `content-filter`, `parse`, or `schema`. See [Structured output](/sdk/structured-output).

## 4. Check capabilities before transport

The model must implement streaming and report `capabilities.streaming: true`. It must also support every optional request feature, such as tools, images, documents, reasoning, or an output schema.

Anvia checks capabilities before starting the provider request and throws `CompletionCapabilityError` for an incompatible request.

## 5. Retry only before progress is exposed

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
