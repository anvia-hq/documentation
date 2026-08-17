# Completions

Use `completionModel(...)` with an `Agent` when a workflow needs instructions, tools, memory, context, or multiple turns.

```ts
import { Agent } from '@anvia/core'
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})

const model = mistral.completionModel({
    modelId: 'mistral-large-latest'
})

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly and concisely.',
})
```

## Generate one answer

```ts
const result = await supportAgent.generate({
    prompt: 'Explain why a refund can take two business days.'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

`generate(...)` runs the agent to completion and returns its normalized result. Use a direct completion when the application owns a single model call and does not need the agent runtime:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Checkout requests timed out for 12 minutes.',
    model,
    instructions: 'Write a concise internal incident summary.',
    maxTokens: 180
})

console.log(result.text)
console.log(result.usage.totalTokens)
```

The first argument is the input. The configured model and request options belong in the second argument.

## Stream an agent run

`agent.stream(...)` returns an async iterable. The run advances as the application consumes it:

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a response to this support ticket.'
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

Consume the stream through its terminal event so usage, tool results, observers, and completion state can settle. Use `@anvia/server` for browser transport instead of exposing provider credentials.

## Supported requests

The adapter maps text instructions and message history, temperature, maximum output tokens, streaming text and tool-call deltas, tools, tool choice, output schemas, and provider-specific parameters.

It rejects chat image and document inputs before making the provider request. Use [Mistral OCR](/sdk/providers/mistral/ocr) as a separate extraction step for scanned documents and images.

## Provider-specific parameters

Pass a Mistral-specific value through `providerOptions` only at the narrow boundary that needs it:

```ts
const result = await generateCompletion({
    prompt: 'Give this release note a short title.',
    model,
    providerOptions: {
        randomSeed: 42,
    }
})
```

The adapter preserves the normalized `model` and `messages` fields even if those keys appear in `providerOptions`. Verify provider option names against the Mistral API version used by your deployment.
