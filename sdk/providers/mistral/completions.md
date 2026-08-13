# Completions

Use `completionModel(...)` for agents, direct model calls, extractors, and model-driven pipeline stages.

```ts
import { Agent } from '@anvia/core'
import { MistralClient } from '@anvia/mistral'

const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})

const model = mistral.completionModel('mistral-large-latest')

export const supportAgent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Answer support questions clearly and concisely.',
})
```

The returned model implements Anvia's streaming completion contract, so it can power both `.send()` and `.stream()` agent runs.

## Send one direct request

Call the model directly when the application owns the flow around a single generation:

```ts
import { createCompletion } from '@anvia/core'

const result = await createCompletion(model, {
  instructions: 'Write a concise internal incident summary.',
  input: 'Checkout requests timed out for 12 minutes.',
  maxTokens: 180,
})

console.log(result.text)
console.log(result.usage.totalTokens)
```

Use an [agent](/sdk/agents) when the run needs tools, memory, dynamic context, hooks, or multiple turns.

## Stream a run

An agent stream executes only while it is consumed:

```ts
for await (const event of supportAgent
  .prompt('Draft a response to this support ticket.')
  .stream()) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

Consume through the final event so usage, tool results, observers, and run completion can settle. For browser transport, expose the run through `@anvia/server` rather than sending provider credentials to the client.

## Supported request features

The adapter maps these completion features to Mistral chat completions:

- text instructions and message history
- temperature and maximum output tokens
- streaming text and tool-call deltas
- tools and tool choice
- JSON output schemas
- provider-specific request parameters

It rejects chat image inputs and document-file inputs before making the provider request. Mistral OCR remains available as a separate model; see [OCR](/sdk/providers/mistral/ocr).

For model-driven application functions and JSON results, continue to [Tools and schemas](/sdk/providers/mistral/tools-and-schemas).

## Provider-specific parameters

Pass Mistral-specific values through the completion helper's `params` option only at the narrow call site that needs them:

```ts
const result = await createCompletion(model, {
  input: 'Give this release note a short title.',
  params: {
    randomSeed: 42,
  },
})
```

The adapter keeps its selected `model` and normalized `messages`; provider parameters cannot replace those request-identity fields. Verify provider option names against the Mistral API version used by the deployment.
