# Streaming completion

This recipe streams one direct completion as normalized events. Use it when the application owns a single model call but should display text before the entire response is ready.

## 1. Create a streaming model

Use the setup from [Text completion](./basic-completion), then save this as `stream-text.ts`:

```ts
import { streamCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const model = new OpenAIClient({ apiKey })
    .completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})

const stream = streamCompletion({
    prompt: 'Explain event streams in one concise paragraph.',
    model,
    instructions: 'Write for a TypeScript developer.'
})

for await (const event of stream) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log(event.result.usage)
  }
}
```

## 2. Run it

```sh
pnpm tsx stream-text.ts
```

Visible text arrives through `text_delta`. The final event contains the normalized completion response and usage. Other event types can represent reasoning, tool-call deltas, sources, or errors, so do not assume every event contains text.

## Streaming boundary

The async iterable advances only while it is consumed. Read it through the terminal event so completion state and usage settle. A direct stream does not execute tool calls or continue additional model turns.

Streaming improves perceived latency, not total provider latency. Partial text is incomplete and untrusted. In a web application, translate events with `@anvia/server`, propagate disconnect cancellation, and store authoritative state from the completed run rather than the fragments displayed by one client.

Continue with the [first agent](./first-agent) for reusable behavior and agent-level streaming.
