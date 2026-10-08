# `@anvia/azure` API reference

The package exports `AzureOpenAIClient`, its `AzureOpenAIClientOptions` type, and `AzureOpenAI`-prefixed aliases for the shared OpenAI completion, embedding, image generation, speech generation, and transcription option and handle types. It has no public subpath exports.

## Client

```ts
import type OpenAI from 'openai'

type AzureOpenAIClientOptions =
  | ({ endpoint: string; baseUrl?: never } | { baseUrl: string; endpoint?: never }) &
      (
        | { apiKey: string; azureADTokenProvider?: never }
        | { azureADTokenProvider: () => Promise<string>; apiKey?: never }
      ) & {
        headers?: Record<string, string>
        fetch?: typeof fetch
        client?: never
      }
  | {
      client: OpenAI
      endpoint?: never
      baseUrl?: never
      apiKey?: never
      azureADTokenProvider?: never
      headers?: never
      fetch?: never
    }

class AzureOpenAIClient {
  constructor(options: AzureOpenAIClientOptions)

  completionModel(options: AzureOpenAICompletionModelOptions): AzureOpenAICompletionModel
  embeddingModel(options: AzureOpenAIEmbeddingModelOptions): AzureOpenAIEmbeddingModelHandle
  imageGenerationModel(
    options: AzureOpenAIImageGenerationModelOptions,
  ): AzureOpenAIImageGenerationModelHandle
  speechGenerationModel(
    options: AzureOpenAISpeechGenerationModelOptions,
  ): AzureOpenAISpeechGenerationModelHandle
  transcriptionModel(
    options: AzureOpenAITranscriptionModelOptions,
  ): AzureOpenAITranscriptionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

`completionModel({ modelId, api?, contextLimits?, controls? })` takes the deployment name as `modelId`, with `api` defaulting to `'chat'`. The option and handle types are the corresponding `@anvia/openai` types under an `AzureOpenAI` prefix:

| Azure alias | Source type |
| --- | --- |
| `AzureOpenAICompletionModel`, `AzureOpenAICompletionModelOptions` | `OpenAICompletionModel`, `OpenAICompletionModelOptions` |
| `AzureOpenAIEmbeddingModelHandle`, `AzureOpenAIEmbeddingModelOptions` | `OpenAIEmbeddingModelHandle`, `OpenAIEmbeddingModelOptions` |
| `AzureOpenAIImageGenerationModelHandle`, `AzureOpenAIImageGenerationModelOptions` | `OpenAIImageGenerationModelHandle`, `OpenAIImageGenerationModelOptions` |
| `AzureOpenAISpeechGenerationModelHandle`, `AzureOpenAISpeechGenerationModelOptions` | `OpenAISpeechGenerationModelHandle`, `OpenAISpeechGenerationModelOptions` |
| `AzureOpenAITranscriptionModelHandle`, `AzureOpenAITranscriptionModelOptions` | `OpenAITranscriptionModelHandle`, `OpenAITranscriptionModelOptions` |

Handles report `provider: 'azure-openai'`. Chat request traces report `azure-openai-chat` and Responses traces report `azure-openai-responses`. `listModels()` failures throw a `ModelListingError` with `provider: 'azure-openai'` and the original error as `cause`.

## Errors

Construction throws `TypeError` for invalid endpoint, credential, or option combinations, as listed in [Configuration](/packages/azure/configuration#client-options). Azure Responses streams that cannot resolve or that conflict on a function name reject with a `CompletionProviderOutputError` of kind `invalid-tool-call`.

## Related `@anvia/openai` export

`@anvia/openai/adapters` (added in `@anvia/openai` 1.2.0) exports `OpenAIResponsesCompletionModel`, the reusable Responses model that provider packages extend. See [Migrate from `@anvia/openai`](/packages/azure/migration#build-a-similar-provider).

Return to the [`@anvia/azure` overview](/packages/azure).
