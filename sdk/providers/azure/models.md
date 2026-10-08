# Deployment models

Azure routes requests by deployment name, so every model factory takes your deployment name as `modelId`.

```ts
import { Agent } from '@anvia/core'
import { azure } from './azure'

const model = azure.completionModel({
  modelId: process.env.AZURE_OPENAI_DEPLOYMENT!,
  api: 'responses',
})

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly and concisely.',
})
```

The returned model implements Anvia's streaming completion contract, so it backs `agent.generate()`, `agent.stream()`, and the direct completion helpers.

## Responses or Chat

`api` is optional and defaults to `'chat'` (Chat Completions). Pass `api: 'responses'` for the Responses API. The Azure Responses model resolves a function name that Azure omits from the terminal tool-argument stream event using the earlier function-call item, rejects streams where it cannot, and sends explicit `type: "message"` on conversation messages for Foundry project endpoints. Both handles report the `azure-openai` provider. See [Responses and Chat](/sdk/providers/openai/responses-and-chat) for the API differences.

## Other capabilities

```ts
const embeddings = azure.embeddingModel({ modelId: 'my-embedding-deployment' })
const images = azure.imageGenerationModel({ modelId: 'my-image-deployment' })
const speech = azure.speechGenerationModel({ modelId: 'my-speech-deployment' })
const transcription = azure.transcriptionModel({ modelId: 'my-transcription-deployment' })
```

These share the OpenAI adapters' behavior; see [Embeddings](/sdk/providers/openai/embeddings) and [Media models](/sdk/providers/openai/media). Availability of tools, media options, and model listing depends on your Azure endpoint and deployment. `listModels()` calls the endpoint's model listing API; it does not enumerate Azure Resource Manager deployments.

## Custom deployment names

Known OpenAI model names keep their inferred reasoning controls and context limits. A custom deployment name such as `production-reasoning` has none, so declare them to match the deployed model:

```ts
const model = azure.completionModel({
  modelId: 'production-reasoning',
  api: 'responses',
  contextLimits: { contextWindow: 128_000, maxOutputTokens: 16_000 },
  controls: {
    reasoningEffort: {
      type: 'select',
      label: 'Reasoning effort',
      options: ['low', 'medium', 'high'],
    },
  },
})
```

For DALL-E deployments with a custom name, pass `providerOptions: { response_format: 'b64_json' }` to image generation; the adapter returns image bytes and does not download URL responses.
