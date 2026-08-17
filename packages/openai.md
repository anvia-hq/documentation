# `@anvia/openai`

OpenAI’s provider adapter covers the broadest set of Anvia model contracts: completions, embeddings, image generation, speech generation, transcription, and model listing. Use it at the model boundary while keeping agents and application logic provider-independent.

| | |
| --- | --- |
| Support | First-party |
| Version | `1.0.0-rc.2` |
| Runtime | ESM, server-side JavaScript |
| Peer | Matching `@anvia/core` release candidate |

## Install

```bash
pnpm add @anvia/openai @anvia/core
```

## Create a completion model

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const agent = new Agent({
  id: 'assistant',
  model: openai.completionModel({
      modelId: 'gpt-5.5',
      api: "responses"
  }),
  instructions: 'Answer clearly and concisely.',
})

const result = await agent.generate({
    prompt: 'Explain semantic search in one paragraph.'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

The required `api` model option selects OpenAI Responses or Chat Completions. A custom `baseUrl` changes the endpoint but does not select the API.

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel({ modelId, api })` | Explicit model and API |
| Dense embeddings | `embeddingModel({ modelId })` | Explicit model |
| Image generation | `imageGenerationModel({ modelId })` | Explicit model |
| Text-to-speech | `speechGenerationModel({ modelId })` | Explicit model |
| Transcription | `transcriptionModel({ modelId })` | Explicit model |
| Model inventory | `listModels()` | Provider model list |

Both completion adapters normalize messages, tool calls, reasoning, usage, structured output, and streaming events into Anvia contracts. The Responses adapter is the native OpenAI path; the Chat adapter supports OpenAI-compatible endpoints and preserves provider-specific reasoning history when required.

## Common patterns

### Configure an OpenAI-compatible endpoint

```ts
const compatible = new OpenAIClient({
  apiKey: process.env.PROVIDER_API_KEY!,
  baseUrl: 'https://provider.example.com/v1',
})

const model = compatible.completionModel({
    modelId: 'provider/model-name',
    api: 'chat',
})
```

### Reuse one client across model capabilities

```ts
const completion = openai.completionModel({
    modelId: 'gpt-5.5',
    api: 'responses',
})
const embeddings = openai.embeddingModel({
    modelId: 'text-embedding-3-small',
    dimensions: 1536,
    maxBatchSize: 64
})
const images = openai.imageGenerationModel({ modelId: 'gpt-image-1' })
```

Create the provider client once at the server boundary. Keep credentials there, inject the returned model contracts, and keep fallback policy and tenant routing in application code.

## Compatibility

`@anvia/openai` is an ESM package and uses the official `openai` SDK. It accepts a preconfigured SDK client for custom transports. Media and embedding methods require endpoints that implement the corresponding OpenAI APIs; an OpenAI-compatible chat endpoint does not imply support for those other capabilities.

## Continue

- [Get started](/packages/openai/get-started)
- [Capabilities](/packages/openai/capabilities)
- [Configuration](/packages/openai/configuration)
- [Compatible endpoints](/packages/openai/compatible-endpoints)
- [Models and media](/packages/openai/models-and-media)
- [API reference](/packages/openai/api-reference)
- [Releases](/packages/openai/releases)
- [OpenAI SDK guide](/sdk/providers/openai)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-openai/CHANGELOG.md)
