# `@anvia/gemini` API reference

Import public symbols from `@anvia/gemini`; the package has no public subpath exports.

## Client

```ts
type GeminiClientOptions =
  | { apiKey: string; vertexAi?: never; client?: never }
  | {
      vertexAi: {
        projectId: string
        location: string
        googleAuthOptions?: GoogleGenAIOptions['googleAuthOptions']
      }
      apiKey?: never
      client?: never
    }
  | { client: GoogleGenAI; apiKey?: never; vertexAi?: never }

class GeminiClient {
  constructor(options: GeminiClientOptions)
  completionModel(options: {
    modelId: GeminiCompletionModelId
    contextLimits?: ModelContextLimits
  }): GeminiCompletionModelHandle
  embeddingModel(options: GeminiEmbeddingModelOptions): GeminiEmbeddingModelHandle
  imageGenerationModel(
    options:
      | { api: 'generateContent'; modelId: GeminiGenerateContentImageModelId }
      | { api: 'generateImages'; modelId: GeminiGenerateImagesModelId },
  ): GeminiImageGenerationModelHandle
  transcriptionModel(options: {
    modelId: GeminiTranscriptionModelId
  }): GeminiTranscriptionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

API-key, Vertex AI, and injected-client modes are mutually exclusive. All model factories require an options object and model ID.

## Embedding options

```ts
type GeminiEmbeddingModelOptions = {
  modelId: GeminiEmbeddingModelId
  dimensions?: number
  maxBatchSize?: number
  taskType?: GeminiEmbeddingTaskType
  title?: string
}
```

`GeminiEmbeddingTaskType` includes retrieval query/document, semantic similarity, classification, clustering, question answering, fact verification, and code retrieval query.

## Images

The `api` discriminant selects the provider surface. `generateContent` accepts Gemini image-capable IDs; `generateImages` accepts Imagen IDs. Both return the common `ImageGenerationModel<unknown>` handle.

The package exports `GEMINI_2_5_FLASH_IMAGE`, `GEMINI_3_PRO_IMAGE_PREVIEW`, and `IMAGEN_4_GENERATE` as convenient known IDs.

## Exported types

The root exports known and extensible model-ID types, model option types, contract-oriented handle types for completion, embeddings, images, and transcription, plus the same surface under the `gemini` namespace.
