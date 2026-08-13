# `@anvia/gemini`

Gemini’s provider adapter connects Anvia to the Gemini Developer API or Vertex AI. It includes completion, embeddings, native Gemini image generation, Imagen generation, transcription, and model listing.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.4.1` |
| Runtime | ESM, server-side JavaScript |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/gemini @anvia/core
```

## Create a Gemini agent

```ts
import { Agent } from '@anvia/core'
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY,
})

const agent = new Agent({
  id: 'assistant',
  model: gemini.completionModel('gemini-2.5-flash'),
})

const result = await agent.prompt('Describe this system in three bullets.').send()
console.log(result.output)
```

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel()` | `gemini-2.5-flash` |
| Dense embeddings | `embeddingModel()` | `gemini-embedding-001` |
| Gemini-native images | `imageGenerationModel()` | `gemini-2.5-flash-image` |
| Imagen images | `imagenGenerationModel()` | `imagen-4.0-generate-001` |
| Audio transcription | `transcriptionModel()` | `gemini-2.5-flash` |
| Model inventory | `listModels()` | Provider model list |

Gemini-native images run through `generateContent`; Imagen uses `generateImages`. They are separate factories because the provider APIs and supported model families differ. Audio generation is not implemented.

## Common patterns

### Use Vertex AI

```ts
const vertex = new GeminiClient({
  vertexai: true,
  project: 'my-gcp-project',
  location: 'us-central1',
})

const model = vertex.completionModel('gemini-2.5-flash')
```

Vertex mode uses Google Application Default Credentials unless `googleAuthOptions` supplies another trusted configuration.

### Tune embeddings for retrieval

```ts
const queryEmbeddings = gemini.embeddingModel('gemini-embedding-001', {
  taskType: 'RETRIEVAL_QUERY',
  dimensions: 768,
  maxBatchSize: 32,
})
```

Use matching dimensions and a compatible task configuration when indexing and querying the same vector collection. `title` is intended for document-oriented embedding tasks.

## Compatibility

`@anvia/gemini` is ESM and uses `@google/genai`. The client options are a discriminated union: API-key mode cannot include Vertex project settings, while `vertexai: true` cannot include `apiKey`. A preconfigured `GoogleGenAI` client can be injected in either mode.

## Continue

- [Get started](/packages/gemini/get-started)
- [Capabilities](/packages/gemini/capabilities)
- [Configuration](/packages/gemini/configuration)
- [Vertex AI](/packages/gemini/vertex-ai)
- [Models and media](/packages/gemini/models-and-media)
- [API reference](/packages/gemini/api-reference)
- [Releases](/packages/gemini/releases)
- [Gemini SDK guide](/sdk/providers/gemini)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-gemini/CHANGELOG.md)
