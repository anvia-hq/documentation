# `@anvia/openai` API reference

All public symbols are exported from the package root:

```ts
import { OpenAIClient, openai } from '@anvia/openai'
```

The package has no public subpath exports.

## `OpenAIClient`

```ts
type OpenAIClientOptions = {
  apiKey?: string
  baseUrl?: string
  headers?: Record<string, string>
  completionApi?: 'responses' | 'chat'
  client?: OpenAI
}

class OpenAIClient implements ModelListingClient {
  readonly client: OpenAI

  constructor(options?: OpenAIClientOptions)

  completionModel(
    model?: OpenAICompletionModelName,
  ): StreamingCompletionModel<unknown, OpenAICompletionModelName>

  embeddingModel(
    model?: OpenAIEmbeddingModelName,
    options?: ProviderEmbeddingModelOptions,
  ): OpenAIEmbeddingModel

  imageGenerationModel(
    model?: OpenAIImageGenerationModelName,
  ): OpenAIImageGenerationModel

  audioGenerationModel(
    model?: OpenAIAudioGenerationModelName,
  ): OpenAIAudioGenerationModel

  transcriptionModel(
    model?: OpenAITranscriptionModelName,
  ): OpenAITranscriptionModel

  listModels(): Promise<ModelList>
}
```

When `client` is absent, construction requires a non-empty `apiKey`. Responses is the default completion API unless `baseUrl` is set; a custom base URL defaults to Chat Completions. `listModels()` normalizes the provider result and wraps failures in `ModelListingError`.

## Completion models

```ts
class OpenAIResponsesCompletionModel
  implements StreamingCompletionModel<unknown, OpenAICompletionModelName> {
  readonly defaultModel: OpenAICompletionModelName
  readonly provider: 'openai'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: OpenAI,
    defaultModel?: OpenAICompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: OpenAICompletionModelName,
  ): CompletionModelInfo<OpenAICompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<OpenAICompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<OpenAICompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<OpenAICompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}

class OpenAIChatCompletionModel
  implements StreamingCompletionModel<unknown, OpenAICompletionModelName> {
  readonly defaultModel: OpenAICompletionModelName
  readonly provider: 'openai-chat'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: OpenAI,
    defaultModel?: OpenAICompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: OpenAICompletionModelName,
  ): CompletionModelInfo<OpenAICompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<OpenAICompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<OpenAICompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<OpenAICompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}
```

Both classes normalize provider responses and streams. The Responses class targets OpenAI Responses; the Chat class targets Chat Completions and compatible endpoints.

## Embeddings

```ts
type ProviderEmbeddingModelOptions = {
  dimensions?: number
  user?: string
  maxBatchSize?: number
}

class OpenAIEmbeddingModel implements EmbeddingModel {
  readonly dimensions: number | undefined
  readonly maxBatchSize: number

  constructor(
    client: OpenAI,
    model: OpenAIEmbeddingModelName,
    options?: ProviderEmbeddingModelOptions,
  )

  embedTexts(texts: string[]): Promise<Embedding[]>
}
```

`embedTexts()` batches inputs up to `maxBatchSize`, preserves input order, and rejects a provider response whose embedding count does not match the request.

## Image generation

```ts
class OpenAIImageGenerationModel
  implements ImageGenerationModel<unknown, OpenAIImageGenerationModelName> {
  readonly defaultModel: OpenAIImageGenerationModelName
  readonly provider: 'openai'

  constructor(client: OpenAI, defaultModel?: OpenAIImageGenerationModelName)

  imageGeneration(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResponse<unknown>>
}
```

Image output is normalized into Anvia’s binary image response. Missing provider image content is an error.

## Audio generation

```ts
class OpenAIAudioGenerationModel
  implements AudioGenerationModel<unknown, OpenAIAudioGenerationModelName> {
  readonly defaultModel: OpenAIAudioGenerationModelName
  readonly provider: 'openai'

  constructor(client: OpenAI, defaultModel?: OpenAIAudioGenerationModelName)

  audioGeneration(
    request: AudioGenerationRequest,
  ): Promise<AudioGenerationResponse<unknown>>
}
```

## Transcription

```ts
class OpenAITranscriptionModel
  implements TranscriptionModel<unknown, OpenAITranscriptionModelName> {
  readonly defaultModel: OpenAITranscriptionModelName
  readonly provider: 'openai'

  constructor(client: OpenAI, defaultModel?: OpenAITranscriptionModelName)

  transcription(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResponse<unknown>>
}
```

## Model name types

`ModelId<Known>` preserves autocomplete for known names while accepting other string IDs supported by compatible endpoints.

```ts
type KnownOpenAICompletionModelName =
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-4o'
  | 'gpt-4o-2024-05-13'
  | 'gpt-4o-2024-08-06'
  | 'gpt-4o-2024-11-20'
  | 'gpt-4o-mini'
  | 'gpt-5'
  | 'gpt-5-chat-latest'
  | 'gpt-5-codex'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'gpt-5-pro'
  | 'gpt-5.1'
  | 'gpt-5.1-chat-latest'
  | 'gpt-5.1-codex'
  | 'gpt-5.1-codex-max'
  | 'gpt-5.1-codex-mini'
  | 'gpt-5.2'
  | 'gpt-5.2-chat-latest'
  | 'gpt-5.2-codex'
  | 'gpt-5.2-pro'
  | 'gpt-5.3-chat-latest'
  | 'gpt-5.3-codex'
  | 'gpt-5.3-codex-spark'
  | 'gpt-5.4'
  | 'gpt-5.4-mini'
  | 'gpt-5.4-nano'
  | 'gpt-5.4-pro'
  | 'gpt-5.5'
  | 'gpt-5.5-pro'
  | 'o1'
  | 'o1-pro'
  | 'o3'
  | 'o3-deep-research'
  | 'o3-mini'
  | 'o3-pro'
  | 'o4-mini'
  | 'o4-mini-deep-research'

type KnownOpenAIEmbeddingModelName =
  | 'text-embedding-3-large'
  | 'text-embedding-3-small'
  | 'text-embedding-ada-002'

type KnownOpenAIImageGenerationModelName =
  | 'chatgpt-image-latest'
  | 'dall-e-2'
  | 'dall-e-3'
  | 'gpt-image-1'
  | 'gpt-image-1-mini'
  | 'gpt-image-1.5'
  | 'gpt-image-2'

type KnownOpenAIAudioGenerationModelName = 'tts-1' | 'tts-1-hd'
type KnownOpenAITranscriptionModelName = 'whisper-1'

type OpenAICompletionModelName = ModelId<KnownOpenAICompletionModelName>
type OpenAIEmbeddingModelName = ModelId<KnownOpenAIEmbeddingModelName>
type OpenAIImageGenerationModelName = ModelId<KnownOpenAIImageGenerationModelName>
type OpenAIAudioGenerationModelName = ModelId<KnownOpenAIAudioGenerationModelName>
type OpenAITranscriptionModelName = ModelId<KnownOpenAITranscriptionModelName>
```

## Constants

```ts
const DALL_E_2 = 'dall-e-2'
const DALL_E_3 = 'dall-e-3'
const GPT_IMAGE_1 = 'gpt-image-1'
const GPT_IMAGE_2 = 'gpt-image-2'
const TTS_1 = 'tts-1'
const TTS_1_HD = 'tts-1-hd'
const WHISPER_1 = 'whisper-1'
```

## `openai` namespace

```ts
import { openai } from '@anvia/openai'

const client = new openai.OpenAIClient({ apiKey })
```

`openai` is a namespace containing the same clients, models, types, and constants exported from the package root. It does not create a client or hold global configuration.

