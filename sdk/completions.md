# Completions

A direct completion sends one normalized request to one [completion model](/sdk/models/completion). It is the smallest way to use a language model through Anvia when application code already owns the workflow.

Use a completion for work such as summarization, rewriting, classification, or drafting. Anvia normalizes the request and response, while your application decides when the call happens and what to do with the result.

## 1. Send one request

The v1 API receives the input first and an options object second:

```ts
import { generateCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})

const result = await generateCompletion({
    prompt: 'Explain provider-neutral AI in one sentence.',
    model,
    instructions: 'Write for a TypeScript developer.',
    maxTokens: 100
})

console.log(result.text)
```

`result.text` is the visible text assembled from the normalized assistant content. The same result also exposes content blocks, token usage, and the complete normalized provider response.

## 2. Choose the completion helper

Use `generateCompletion()` when the application needs one completed response:

```ts
const result = await generateCompletion({
    prompt: 'Summarize this incident.',
    model
})
```

Use `streamCompletion()` when an interface should receive model events as they arrive:

```ts
import { streamCompletion } from '@anvia/core'

for await (const event of streamCompletion({
    prompt: 'Draft a short status update.',
    model
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

Use `generateCompletion()` when the result must match a Zod schema:

```ts
import { generateCompletion } from '@anvia/core'
import { z } from 'zod'

const schema = z.object({
  category: z.enum(['question', 'request', 'incident']),
  urgent: z.boolean(),
})

const result = await generateCompletion({
    prompt: 'Production is returning 503 errors.',
    model,
    outputSchema: schema
})

console.log(result.output.category)
```

The model must support the capability required by the request. Anvia rejects unsupported streaming, tools, document input, or output schemas before sending the provider call.

## 3. Know the boundary

A direct completion makes one provider call. It does not run an agent loop, load or save memory, retrieve application context automatically, or execute local tool calls.

Passing tool definitions lets a compatible model request a tool, but the returned tool call remains application data. Use an [agent](/sdk/agents) when Anvia should execute tools, manage approvals, repeat model turns, or coordinate memory and context.

Continue with [Create a completion](/sdk/completions/create) for input forms and request controls.
