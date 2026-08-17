# Gemini

`@anvia/gemini` connects Anvia to Google's Gemini API or Gemini models on Vertex AI. One `GeminiClient` creates provider-neutral models for completions, embeddings, image generation, and transcription.

Choose the connection at the application boundary. Agents, extractors, pipelines, and media workflows receive an Anvia model and do not need to know which Google endpoint created it.

## Choose a connection

Use `apiKey` for the Gemini API. Use `vertexAi: { projectId, location }` for Vertex AI. Use `client` to inject an existing `GoogleGenAI` instance owned by the application.

Start with the Gemini API for a simple API-key integration. Use Vertex AI when the application already relies on Google Cloud IAM, project-level quotas, or regional deployment controls.

## Create a completion model

```ts
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})

export const model = gemini.completionModel({
    modelId: 'gemini-2.5-flash'
})
```

Pass `model` to an agent, direct completion, extractor, or pipeline. Keep the client and credentials in server-only code.

## Model factories

Use `completionModel()` for text, tools, schemas, and multimodal understanding. Use `embeddingModel()` for vectors. Use `imageGenerationModel({ api: 'generateContent', ... })` for Gemini-native image models and `api: 'generateImages'` for Imagen. Use `transcriptionModel()` for audio-to-text and `listModels()` for normalized inventory.

These factories share a client, but they are different model contracts. For example, a completion model that understands an image cannot be passed where an image-generation model is required.

## Completion capabilities

The completion adapter supports streaming, tools and tool choice, image input, document-like file input, output schemas, and reasoning content. The exact Gemini model and deployment must also support the requested capability.

## In this section

- [Setup](/sdk/providers/gemini/setup) installs the package and creates a server-side client.
- [Completions](/sdk/providers/gemini/completions) covers agents, tools, streaming, structured data, and reasoning.
- [Multimodal input](/sdk/providers/gemini/multimodal-input) explains images, documents, and media boundaries.
- [Embeddings](/sdk/providers/gemini/embeddings) configures vectors for retrieval and related workloads.
- [Image and transcription](/sdk/providers/gemini/media-models) covers the separate media model factories.
- [Vertex AI](/sdk/providers/gemini/vertex-ai) configures Google Cloud authentication.
- [Models and options](/sdk/providers/gemini/model-options) covers model IDs, provider parameters, and listing.
- [Production](/sdk/providers/gemini/production) covers operational and security guidance.
