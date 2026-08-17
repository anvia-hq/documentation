# `@anvia/openai` API reference

The package exports `OpenAIClient`, model option/handle types, known and extensible model-ID types, media model constants, and the same surface under the `openai` namespace.

## Client

```ts
import type OpenAI from 'openai'
import type { ModelContextLimits } from '@anvia/core/completion'

type OpenAIClientOptions =
  | {
      apiKey: string
      baseUrl?: string
      headers?: Record<string, string>
      client?: never
    }
  | {
      client: OpenAI
      apiKey?: never
      baseUrl?: never
      headers?: never
    }

class OpenAIClient {
  constructor(options: OpenAIClientOptions)

  completionModel(options: {
    modelId: OpenAICompletionModelId
    api: 'responses' | 'chat'
    contextLimits?: ModelContextLimits
  }): OpenAICompletionModel

  embeddingModel(options: {
    modelId: OpenAIEmbeddingModelId
    dimensions?: number
    user?: string
    maxBatchSize?: number
  }): OpenAIEmbeddingModelHandle

  imageGenerationModel(options: {
    modelId: OpenAIImageGenerationModelId
  }): OpenAIImageGenerationModelHandle

  speechGenerationModel(options: {
    modelId: OpenAISpeechGenerationModelId
  }): OpenAISpeechGenerationModelHandle

  transcriptionModel(options: {
    modelId: OpenAITranscriptionModelId
  }): OpenAITranscriptionModelHandle

  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

All constructors and factories require one options object. `completionModel()` requires an explicit API; `baseUrl` does not select it. The two client forms are mutually exclusive: either provide managed connection options or inject an initialized OpenAI SDK client.

## Model IDs and handles

The package exports known-ID unions and extensible IDs for completion, embedding, image generation, speech generation, and transcription. Factory results are exported as contract-oriented handle types:

```ts
type OpenAICompletionModel = StreamingCompletionModel<unknown>
type OpenAIEmbeddingModelHandle = EmbeddingModel
type OpenAIImageGenerationModelHandle = ImageGenerationModel<unknown>
type OpenAISpeechGenerationModelHandle = SpeechGenerationModel<unknown>
type OpenAITranscriptionModelHandle = TranscriptionModel<unknown>
```

Known IDs provide autocomplete while `ModelId<Known>` still permits provider or gateway IDs that are not yet in the package.

## Constants and namespace

```ts
import {
  DALL_E_2,
  DALL_E_3,
  GPT_IMAGE_1,
  GPT_IMAGE_2,
  TTS_1,
  TTS_1_HD,
  WHISPER_1,
  openai,
} from '@anvia/openai'
```

`openai` contains the same client, types, and constants as the root entry point. The package has no public subpath exports.
