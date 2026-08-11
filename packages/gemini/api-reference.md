# `@anvia/gemini` API reference

Import every public symbol from `@anvia/gemini`. The package has no public subpath exports.

## `GeminiClient`

```ts
type GeminiApiClientOptions = {
  apiKey?: string
  vertexai?: false
  project?: never
  location?: never
}

type VertexClientOptions = {
  vertexai: true
  project?: string
  location?: string
  googleAuthOptions?: GoogleGenAIOptions['googleAuthOptions']
  apiKey?: never
}

type GeminiClientOptions = (GeminiApiClientOptions | VertexClientOptions) & {
  client?: GoogleGenAI
}

class GeminiClient implements ModelListingClient {
  readonly client: GoogleGenAI

  constructor(options?: GeminiClientOptions)

  completionModel(
    model?: GeminiCompletionModelName,
  ): GeminiCompletionModel

  embeddingModel(
    model?: GeminiEmbeddingModelName,
    options?: GeminiEmbeddingModelOptions,
  ): GeminiEmbeddingModel

  imageGenerationModel(
    model?: GeminiImageGenerationModelName,
  ): GeminiImageGenerationModel

  imagenGenerationModel(
    model?: GeminiImageGenerationModelName,
  ): GeminiImagenGenerationModel

  transcriptionModel(
    model?: GeminiTranscriptionModelName,
  ): GeminiTranscriptionModel

  listModels(): Promise<ModelList>
}
```

API-key mode and Vertex mode are mutually exclusive. A supplied `client` is used directly. Factory defaults are `gemini-2.5-flash`, `gemini-embedding-001`, `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, and `gemini-2.5-flash`, respectively. Model-listing failures become `ModelListingError`.

## `GeminiCompletionModel`

```ts
class GeminiCompletionModel
  implements StreamingCompletionModel<unknown, GeminiCompletionModelName> {
  readonly defaultModel: GeminiCompletionModelName
  readonly provider: 'gemini'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: GoogleGenAI,
    defaultModel?: GeminiCompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: GeminiCompletionModelName,
  ): CompletionModelInfo<GeminiCompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<GeminiCompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<GeminiCompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<GeminiCompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}
```

## `GeminiEmbeddingModel`

```ts
type GeminiEmbeddingTaskType =
  | 'TASK_TYPE_UNSPECIFIED'
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'
  | 'CLUSTERING'
  | 'QUESTION_ANSWERING'
  | 'FACT_VERIFICATION'
  | 'CODE_RETRIEVAL_QUERY'

type GeminiEmbeddingModelOptions = {
  dimensions?: number
  maxBatchSize?: number
  taskType?: GeminiEmbeddingTaskType
  title?: string
}

class GeminiEmbeddingModel implements EmbeddingModel {
  readonly dimensions: number | undefined
  readonly maxBatchSize: number

  constructor(
    client: GoogleGenAI,
    model: GeminiEmbeddingModelName,
    options?: GeminiEmbeddingModelOptions,
  )

  embedTexts(texts: string[]): Promise<Embedding[]>
}
```

The adapter batches requests, preserves input order, and rejects provider output with a mismatched embedding count. `dimensions`, `taskType`, and `title` are forwarded through Gemini’s embedding configuration.

## Image models

```ts
class GeminiImageGenerationModel
  implements ImageGenerationModel<unknown, GeminiImageGenerationModelName> {
  readonly defaultModel: GeminiImageGenerationModelName
  readonly provider: 'gemini'

  constructor(client: GoogleGenAI, defaultModel?: GeminiImageGenerationModelName)

  imageGeneration(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResponse<unknown>>
}

class GeminiImagenGenerationModel
  implements ImageGenerationModel<unknown, GeminiImageGenerationModelName> {
  readonly defaultModel: GeminiImageGenerationModelName
  readonly provider: 'gemini'

  constructor(client: GoogleGenAI, defaultModel?: GeminiImageGenerationModelName)

  imageGeneration(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResponse<unknown>>
}
```

`GeminiImageGenerationModel` uses Gemini `generateContent` and reads inline image parts. `GeminiImagenGenerationModel` uses `generateImages` and reads Imagen image bytes. A response without image content is rejected.

## `GeminiTranscriptionModel`

```ts
class GeminiTranscriptionModel
  implements TranscriptionModel<unknown, GeminiTranscriptionModelName> {
  readonly defaultModel: GeminiTranscriptionModelName
  readonly provider: 'gemini'

  constructor(client: GoogleGenAI, defaultModel?: GeminiTranscriptionModelName)

  transcription(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResponse<unknown>>
}
```

Transcription sends the audio as inline content through `generateContent` and normalizes the returned text.

## Model name types

```ts
type KnownGeminiCompletionModelName =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-image'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash-preview-tts'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-pro-preview-tts'
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-image-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-3.1-flash-image-preview'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-flash-lite-preview'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-pro-preview-customtools'
  | 'gemini-3.5-flash'
  | 'gemini-flash-latest'
  | 'gemini-flash-lite-latest'
  | 'gemma-4-26b-a4b-it'
  | 'gemma-4-31b-it'

type KnownGeminiEmbeddingModelName = 'gemini-embedding-001'

type KnownGeminiImageGenerationModelName =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'gemini-3.1-flash-image-preview'
  | 'imagen-4.0-generate-001'

type GeminiCompletionModelName = ModelId<KnownGeminiCompletionModelName>
type GeminiEmbeddingModelName = ModelId<KnownGeminiEmbeddingModelName>
type GeminiImageGenerationModelName = ModelId<KnownGeminiImageGenerationModelName>
type GeminiTranscriptionModelName = GeminiCompletionModelName
```

## Constants

```ts
const GEMINI_2_5_FLASH_IMAGE = 'gemini-2.5-flash-image'
const GEMINI_3_PRO_IMAGE_PREVIEW = 'gemini-3-pro-image-preview'
const IMAGEN_4_GENERATE = 'imagen-4.0-generate-001'
```

## `gemini` namespace

`gemini` contains the same clients, classes, constants, option types, and model-name types exported at the package root:

```ts
import { gemini } from '@anvia/gemini'

const client = new gemini.GeminiClient({ apiKey })
```

