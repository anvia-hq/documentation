# Completion models

A completion model converts normalized instructions, messages, documents, and tools into assistant content. It is the model contract used by direct completions, agents, structured output, extractors, and model-driven pipeline stages.

## 1. Create a completion model

The provider client maps Anvia requests into the provider API and normalizes the response.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })

export const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})
```

OpenAI requires `api: 'responses' | 'chat'` when creating a completion model. A compatible `baseUrl` does not select the adapter.

## 2. Send one completion

The v1 API receives the input first and an options object second.

```ts
import { generateCompletion } from '@anvia/core'
import { model } from './model'

const result = await generateCompletion({
    prompt: 'Summarize this incident in one sentence.',
    model,
    instructions: 'Answer clearly and concisely.',
    maxTokens: 120
})

console.log(result.text)
console.log(result.usage)
```

The result contains visible text, normalized assistant content, usage, and the complete normalized provider response.

## 3. Stream a completion

Use `streamCompletion()` for a direct model call that should update an interface incrementally.

```ts
import { streamCompletion } from '@anvia/core'

for await (const event of streamCompletion({
    prompt: 'Draft a short incident update.',
    model
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }

  if (event.type === 'final') {
    process.stdout.write('\n')
    console.log(event.result.usage)
  }
}
```

The model must declare `capabilities.streaming: true`. Anvia rejects unsupported requests before invoking the provider.

## 4. Inspect capabilities

Completion capabilities describe what the adapter can accept and return.

```ts
const {
  streaming,
  tools,
  toolChoice,
  imageInput,
  documentInput,
  outputSchema,
  reasoning,
  providerTools,
} = model.capabilities
```

Capabilities are adapter-level declarations, not a guarantee that every provider model ID or account supports the feature. Test the exact configuration used by the application.

## 5. Reuse the model in an agent

The same completion model can power reusable agent behavior:

```ts
import { Agent } from '@anvia/core'

const agent = new Agent({
  id: 'incident-assistant',
  model,
  instructions: 'Help responders write accurate incident updates.',
  maxTurns: 4,
})

const response = await agent.generate({
    prompt: 'Draft the first customer update.'
})
```

Use a [direct completion](/sdk/completions) when application code owns one call. Use an [agent](/sdk/agents) when behavior is reusable or the task may need tools, memory, context, approvals, or multiple turns.

Continue with [Embedding models](/sdk/models/embeddings).
