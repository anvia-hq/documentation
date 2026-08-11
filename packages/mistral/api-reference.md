# `@anvia/mistral` API reference

Import every public symbol from `@anvia/mistral`. The package has no public subpath exports.

## `MistralClient`

```ts
type MistralClientOptions = {
  apiKey?: string
  serverURL?: string
  client?: Mistral
}

class MistralClient implements ModelListingClient {
  readonly client: Mistral

  constructor(options?: MistralClientOptions)

  completionModel(
    model?: MistralCompletionModelName,
  ): MistralCompletionModel

  embeddingModel(
    model?: MistralEmbeddingModelName,
    options?: MistralEmbeddingModelOptions,
  ): MistralEmbeddingModel

  ocrModel(model?: MistralOcrModelName): MistralOcrModel

  listModels(): Promise<ModelList>
}
```

Construction requires a non-empty API key unless `client` is supplied. The factories default to `mistral-large-latest`, `mistral-embed`, and `mistral-ocr-latest`. Model-listing failures become `ModelListingError`.

## `MistralCompletionModel`

```ts
class MistralCompletionModel
  implements StreamingCompletionModel<unknown, MistralCompletionModelName> {
  readonly defaultModel: MistralCompletionModelName
  readonly provider: 'mistral'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: Mistral,
    defaultModel?: MistralCompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: MistralCompletionModelName,
  ): CompletionModelInfo<MistralCompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<MistralCompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<MistralCompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<MistralCompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}
```

## `MistralEmbeddingModel`

```ts
type MistralEmbeddingModelOptions = {
  dimensions?: number
  maxBatchSize?: number
}

class MistralEmbeddingModel implements EmbeddingModel {
  readonly dimensions: number | undefined
  readonly maxBatchSize: number

  constructor(
    client: Mistral,
    model: MistralEmbeddingModelName,
    options?: MistralEmbeddingModelOptions,
  )

  embedTexts(texts: string[]): Promise<Embedding[]>
}
```

`embedTexts()` batches the input, preserves order, and rejects mismatched provider output counts.

## OCR

```ts
type MistralOcrSource =
  | {
      type: 'document_url'
      url: string
      documentName?: string
    }
  | {
      type: 'image_url'
      url: string
    }
  | {
      type: 'file_id'
      fileId: string
    }
  | {
      type: 'bytes'
      data: Uint8Array | ArrayBuffer
      filename: string
      expiry?: number | null
      visibility?: 'workspace' | 'user'
    }

type MistralOcrRequest = {
  source: MistralOcrSource
  pages?: string | number[] | null
  includeImageBase64?: boolean | null
  imageLimit?: number | null
  imageMinSize?: number | null
  bboxAnnotationFormat?: JsonValue | null
  documentAnnotationFormat?: JsonValue | null
  documentAnnotationPrompt?: string | null
  tableFormat?: 'markdown' | 'html' | null
  extractHeader?: boolean
  extractFooter?: boolean
  confidenceScoresGranularity?: 'word' | 'page' | null
  additionalParams?: JsonValue
}

type MistralOcrUploadedFile = {
  id: string
  filename?: string
  sizeBytes?: number
  purpose?: string
  rawResponse: unknown
}

type MistralOcrPage = {
  index: number
  markdown: string
  images: unknown[]
  tables?: unknown[]
  hyperlinks?: string[]
  header?: string | null
  footer?: string | null
  dimensions?: unknown
  confidenceScores?: unknown
}

type MistralOcrResponse<RawResponse = unknown> = {
  text: string
  markdown: string
  pages: MistralOcrPage[]
  model?: string
  usageInfo?: unknown
  documentAnnotation?: string | null
  uploadedFile?: MistralOcrUploadedFile
  rawResponse: RawResponse
}

class MistralOcrModel {
  readonly defaultModel: MistralOcrModelName
  readonly provider: 'mistral'

  constructor(client: Mistral, defaultModel?: MistralOcrModelName)

  ocr(request: MistralOcrRequest): Promise<MistralOcrResponse<unknown>>
}
```

Byte sources are uploaded before OCR and add `uploadedFile` to the normalized response. Empty byte sources are rejected.

## Mapping helpers

```ts
function toMistralChatParams(
  defaultModel: MistralCompletionModelName,
  request: CompletionRequest<MistralCompletionModelName>,
): Record<string, unknown>

function fromMistralChatResponse(response: unknown): CompletionResponse

function fromMistralChatStreamChunk(
  chunk: unknown,
): CompletionStreamEvent[]

const mistralMessageHelpers: {
  messageToMistralMessages(
    message: Message,
  ): Record<string, unknown>[]

  toolDefinitionToMistral(
    tool: ToolDefinition,
  ): Record<string, unknown>
}
```

These functions expose the same request and response normalization used by `MistralCompletionModel`. Malformed tool arguments can throw during normalization.

## Model name types

```ts
type KnownMistralCompletionModelName =
  | 'codestral-latest'
  | 'devstral-2512'
  | 'devstral-latest'
  | 'devstral-medium-2507'
  | 'devstral-medium-latest'
  | 'devstral-small-2505'
  | 'devstral-small-2507'
  | 'labs-devstral-small-2512'
  | 'magistral-medium-latest'
  | 'magistral-small'
  | 'ministral-3b-latest'
  | 'ministral-8b-latest'
  | 'mistral-large-2411'
  | 'mistral-large-2512'
  | 'mistral-large-latest'
  | 'mistral-medium-2505'
  | 'mistral-medium-2508'
  | 'mistral-medium-2604'
  | 'mistral-medium-latest'
  | 'mistral-nemo'
  | 'mistral-small-2506'
  | 'mistral-small-2603'
  | 'mistral-small-latest'
  | 'open-mistral-7b'
  | 'open-mistral-nemo'
  | 'open-mixtral-8x22b'
  | 'open-mixtral-8x7b'
  | 'pixtral-12b'
  | 'pixtral-large-latest'

type KnownMistralEmbeddingModelName = 'mistral-embed'
type KnownMistralOcrModelName = 'mistral-ocr-latest'

type MistralCompletionModelName = ModelId<KnownMistralCompletionModelName>
type MistralEmbeddingModelName = ModelId<KnownMistralEmbeddingModelName>
type MistralOcrModelName = ModelId<KnownMistralOcrModelName>
```

## Constant and namespace

```ts
const MISTRAL_OCR_LATEST = 'mistral-ocr-latest'

import { mistral } from '@anvia/mistral'
const client = new mistral.MistralClient({ apiKey })
```

`mistral` contains the same public clients, models, types, constant, and mapping helpers exported at the package root.

