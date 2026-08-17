# `@anvia/gemini`

Gemini’s provider adapter connects Anvia to the Gemini Developer API or Vertex AI. It includes completion, embeddings, native Gemini image generation, Imagen generation, transcription, and model listing.

| | |
| --- | --- |
| Support | First-party |
| Version | `1.0.0-rc.2` |
| Runtime | ESM, server-side JavaScript |
| Peer | Matching `@anvia/core` release candidate |

## Install

```bash
pnpm add @anvia/gemini @anvia/core
```

## Create a Gemini agent

```ts
import { Agent } from '@anvia/core'
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

const agent = new Agent({
  id: 'assistant',
  model: gemini.completionModel({
      modelId: 'gemini-2.5-flash'
  }),
})

const result = await agent.generate({
    prompt: 'Describe this system in three bullets.'
})

if (result.status === 'completed') {
  console.log(result.output)
}
```

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel({ modelId })` | Explicit model |
| Dense embeddings | `embeddingModel({ modelId })` | Explicit model |
| Gemini-native images | `imageGenerationModel({ api: 'generateContent', modelId })` | Explicit model |
| Imagen images | `imageGenerationModel({ api: 'generateImages', modelId })` | Explicit model |
| Audio transcription | `transcriptionModel({ modelId })` | Explicit model |
| Model inventory | `listModels()` | Provider model list |

Gemini-native images run through `generateContent`; Imagen uses `generateImages`. One discriminated factory supports both provider APIs and model families. Audio generation is not implemented.

## Common patterns

### Use Vertex AI

```ts
const vertex = new GeminiClient({
  vertexAi: {
    projectId: 'my-gcp-project',
    location: 'us-central1',
  },
})

const model = vertex.completionModel({
    modelId: 'gemini-2.5-flash'
})
```

Vertex mode uses Google Application Default Credentials unless `googleAuthOptions` supplies another trusted configuration.

### Tune embeddings for retrieval

```ts
const queryEmbeddings = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    taskType: 'RETRIEVAL_QUERY',
    dimensions: 768,
    maxBatchSize: 32
})
```

Use matching dimensions and a compatible task configuration when indexing and querying the same vector collection. `title` is intended for document-oriented embedding tasks.

## Compatibility

`@anvia/gemini` is ESM and uses `@google/genai`. The client options are a discriminated union: API-key mode cannot include `vertexAi`, and Vertex mode cannot include `apiKey`. A preconfigured `GoogleGenAI` client is the third mutually exclusive form.

## Continue

- [Get started](/packages/gemini/get-started)
- [Capabilities](/packages/gemini/capabilities)
- [Configuration](/packages/gemini/configuration)
- [Vertex AI](/packages/gemini/vertex-ai)
- [Models and media](/packages/gemini/models-and-media)
- [API reference](/packages/gemini/api-reference)
- [Releases](/packages/gemini/releases)
- [Gemini SDK guide](/sdk/providers/gemini)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-gemini/CHANGELOG.md)
