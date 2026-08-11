# Completion models

A completion model turns normalized messages into assistant content. It is the model contract used by direct completions, agents, structured output, extractors, and model-driven pipeline stages.

## Create a completion model

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const model = openai.completionModel('gpt-5.5')
```

Provider packages map Anvia requests into their SDK and return normalized responses.

## Send one request

```ts
import { createCompletion } from '@anvia/core'
import { model } from './model'

const result = await createCompletion(model, {
  instructions: 'Answer clearly and concisely.',
  input: 'Summarize this incident in one sentence.',
  maxTokens: 120,
})

console.log(result.text)
```

Use [Completions](/sdk/completions) for the full request and result workflow, or pass the same model to an [agent](/sdk/agents).

## Capabilities

Completion models declare whether they support streaming, tools, tool choice, image input, document input, output schemas, reasoning, and provider-executed tools.

Do not infer support from the model name alone. Smoke test the exact model ID with every capability your workflow requires.
