# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/azure
```

Create one client at the server boundary. Provide exactly one endpoint form (`endpoint` or `baseUrl`) and exactly one credential (`apiKey` or `azureADTokenProvider`), unless you inject an initialized SDK client.

```ts
import { Agent } from '@anvia/core'
import { AzureOpenAIClient } from '@anvia/azure'

const azure = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})

const agent = new Agent({
  id: 'support',
  model: azure.completionModel({
    modelId: process.env.AZURE_OPENAI_DEPLOYMENT!,
    api: 'responses',
  }),
  instructions: 'Answer support questions clearly.',
  maxTurns: 4,
})

const result = await agent.generate({
  prompt: 'Draft a concise reply to this ticket.',
})

if (result.type === 'response') {
  console.log(result.output)
}
```

`modelId` is the Azure deployment name. `completionModel()` returns an Anvia `StreamingCompletionModel`, so the same object works with agents and direct completion APIs. Omit `api` for Chat Completions, which is the default.

## Stream a run

```ts
for await (const event of agent.stream({ prompt: 'Explain the resolution.' })) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.delta)
  }
}
```

## Add another capability

```ts
const embeddings = azure.embeddingModel({ modelId: 'my-embedding-deployment' })
const images = azure.imageGenerationModel({ modelId: 'my-image-deployment' })
const speech = azure.speechGenerationModel({ modelId: 'my-speech-deployment' })
const transcription = azure.transcriptionModel({ modelId: 'my-transcription-deployment' })
```

These objects share the underlying SDK client but not request state, and each needs a matching deployment on your endpoint.

## Before production

- Keep the key or token provider on the server.
- Use one credential variable set per provider, such as `AZURE_OPENAI_*`, rather than reusing OpenAI variable names.
- Use deployment names as model IDs and keep them in deployment configuration.
- Set explicit `contextLimits` and `controls` for custom deployment names.
- Bound agent turns, tool access, and request timeouts in application policy; the managed client does not retry.
- Smoke test streaming and tool calls against the real endpoint. See [Configuration](/packages/azure/configuration#live-test).
