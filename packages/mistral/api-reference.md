# `@anvia/mistral` API reference

Import every public symbol from `@anvia/mistral`. The package has no public subpath exports.

## Client and model factories

```ts
type MistralClientOptions =
  | { apiKey: string; baseUrl?: string; client?: never }
  | { client: Mistral; apiKey?: never; baseUrl?: never }

class MistralClient implements ModelListingClient {
  constructor(options: MistralClientOptions)
  completionModel(options: MistralCompletionModelOptions): MistralCompletionModelHandle
  embeddingModel(options: MistralEmbeddingModelOptions): MistralEmbeddingModelHandle
  ocrModel(options: MistralOcrModelOptions): MistralOcrModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}

type MistralCompletionModelOptions = {
  modelId: MistralCompletionModelId
  contextLimits?: ModelContextLimits
}

type MistralEmbeddingModelOptions = {
  modelId: MistralEmbeddingModelId
  dimensions?: number
  maxBatchSize?: number
}

type MistralOcrModelOptions = { modelId: MistralOcrModelId }
```

All constructors and factories require one options object. Managed credentials and an injected Mistral SDK client are mutually exclusive. Model IDs are explicit; there are no factory defaults.

The completion and embedding factories return the Core `StreamingCompletionModel` and `EmbeddingModel` contracts. OCR returns a handle exposing `provider`, `modelId`, and `ocr()`.

## OCR

`MistralOcrSource` accepts `document_url`, `image_url`, `file_id`, or `bytes`. Byte sources require a filename and may set provider expiry and visibility. `MistralOcrRequest` also accepts page selection, image extraction limits, annotations, table format, header/footer extraction, confidence granularity, provider options, and an abort signal.

`MistralOcrResponse` includes combined `text` and `markdown`, normalized pages, optional model and usage data, optional upload metadata, and the raw provider response. Empty byte sources are rejected.

## Mapping helpers

```ts
function toMistralChatParams(
  modelId: MistralCompletionModelId,
  request: CompletionRequest,
): Record<string, unknown>

function fromMistralChatResponse(response: unknown): CompletionResponse
function fromMistralChatStreamChunk(chunk: unknown): CompletionModelStreamEvent[]
```

`mistralMessageHelpers` separately exposes `messageToMistralMessages()` and `toolDefinitionToMistral()`. These low-level exports use the same normalization as the completion handle.

## Model IDs and namespace

Completion, embedding, and OCR IDs use exported `ModelId<Known...ModelId>` types. Known IDs provide autocomplete while other strings remain valid. `MISTRAL_OCR_LATEST` is also exported.

The `mistral` namespace re-exports the same client, helpers, constants, and public types. It has no state of its own.
