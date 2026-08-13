# `@anvia/openai`

OpenAI’s provider adapter covers the broadest set of Anvia model contracts: completions, embeddings, image generation, speech generation, transcription, and model listing. Use it at the model boundary while keeping agents and application logic provider-independent.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.5.1` |
| Runtime | ESM, server-side JavaScript |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/openai @anvia/core
```

## Create a completion model

```ts
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const agent = new Agent({
  id: 'assistant',
  model: openai.completionModel('gpt-5'),
  instructions: 'Answer clearly and concisely.',
})

const result = await agent.prompt('Explain semantic search in one paragraph.').send()
console.log(result.output)
```

The client uses OpenAI’s Responses API by default. A custom `baseUrl` selects the Chat Completions adapter by default, which is useful for OpenAI-compatible services. Set `completionApi` explicitly when the endpoint supports both.

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel()` | `gpt-5` |
| Dense embeddings | `embeddingModel()` | `text-embedding-3-small` |
| Image generation | `imageGenerationModel()` | `gpt-image-1` |
| Text-to-speech | `audioGenerationModel()` | `tts-1` |
| Transcription | `transcriptionModel()` | `whisper-1` |
| Model inventory | `listModels()` | Provider model list |

Both completion adapters normalize messages, tool calls, reasoning, usage, structured output, and streaming events into Anvia contracts. The Responses adapter is the native OpenAI path; the Chat adapter supports OpenAI-compatible endpoints and preserves provider-specific reasoning history when required.

## Common patterns

### Configure an OpenAI-compatible endpoint

```ts
const compatible = new OpenAIClient({
  apiKey: process.env.PROVIDER_API_KEY,
  baseUrl: 'https://provider.example.com/v1',
  completionApi: 'chat',
})

const model = compatible.completionModel('provider/model-name')
```

### Reuse one client across model capabilities

```ts
const completion = openai.completionModel('gpt-5')
const embeddings = openai.embeddingModel('text-embedding-3-small', {
  dimensions: 1536,
  maxBatchSize: 64,
})
const images = openai.imageGenerationModel()
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
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-openai/CHANGELOG.md)
