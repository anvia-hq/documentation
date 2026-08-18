# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/openai
```

Create one client at the server boundary. Construction requires `apiKey` unless an initialized OpenAI client is supplied.

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const agent = new Agent({
  id: 'support',
  model: openai.completionModel({
      modelId: 'gpt-5.6-luna',
      api: "responses"
  }),
  instructions: 'Answer support questions clearly.',
  maxTurns: 4,
})

const result = await agent.generate({
    prompt: 'Draft a concise reply to this ticket.'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

`completionModel({ modelId, api })` requires `api: 'responses' | 'chat'`. It returns an Anvia `StreamingCompletionModel`, so the same object works with agents and direct completion APIs.

## Stream a run

```ts
for await (const event of agent.stream({
    prompt: 'Explain the resolution.'
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

The agent stream includes runtime events around the provider stream: turns, tools, usage, completion, and errors. For one provider call without an agent loop, use [Completions](/sdk/completions).

## Add another model capability

Create only the capability objects the process needs:

```ts
const embeddings = openai.embeddingModel({
    modelId: 'text-embedding-3-small'
})
const image = openai.imageGenerationModel({ modelId: 'gpt-image-2' })
const speech = openai.speechGenerationModel({ modelId: 'tts-1' })
const transcription = openai.transcriptionModel({ modelId: 'whisper-1' })
```

These objects share the underlying OpenAI SDK client but do not share request state.

## Before production

- Keep the API key on the server.
- Set explicit model IDs instead of relying on defaults across releases.
- Bound agent turns, tool access, and request timeouts in application policy.
- Inspect provider errors rather than retrying every failure.
- Record normalized usage through an Anvia observer.
- Review [Responses and compatible endpoints](/packages/openai/compatible-endpoints) before targeting a non-OpenAI service.
