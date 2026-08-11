# `@anvia/grok` API reference

Import every public symbol from `@anvia/grok`. The package has no public subpath exports.

## `GrokClient`

```ts
type GrokClientOptions = {
  apiKey?: string
  baseUrl?: string
  headers?: Record<string, string>
  completionApi?: 'responses' | 'chat'
  client?: OpenAI
  fetch?: typeof fetch
}

class GrokClient implements ModelListingClient {
  readonly client: OpenAI

  constructor(options?: GrokClientOptions)

  completionModel(
    model?: GrokCompletionModelName,
  ): GrokResponsesCompletionModel | GrokChatCompletionModel

  imageGenerationModel(
    model?: GrokImageGenerationModelName,
  ): GrokImageGenerationModel

  audioGenerationModel(): GrokAudioGenerationModel
  transcriptionModel(): GrokTranscriptionModel
  listModels(): Promise<ModelList>
}
```

The client targets `XAI_BASE_URL` and Responses by default. Construction requires a non-empty API key unless a supplied OpenAI client contains one. Factories default to `grok-4.5` and `grok-imagine-image`. `listModels()` normalizes the xAI result and wraps provider failures in `ModelListingError`.

## Completion models

```ts
class GrokResponsesCompletionModel
  implements StreamingCompletionModel<unknown, GrokCompletionModelName> {
  readonly defaultModel: GrokCompletionModelName
  readonly provider: 'grok'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: OpenAI,
    defaultModel?: GrokCompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: GrokCompletionModelName,
  ): CompletionModelInfo<GrokCompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<GrokCompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<GrokCompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<GrokCompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}

class GrokChatCompletionModel
  implements StreamingCompletionModel<unknown, GrokCompletionModelName> {
  readonly defaultModel: GrokCompletionModelName
  readonly provider: 'grok-chat'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: OpenAI,
    defaultModel?: GrokCompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: GrokCompletionModelName,
  ): CompletionModelInfo<GrokCompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<GrokCompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<GrokCompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<GrokCompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}
```

The Responses adapter supports xAI provider-executed tools and normalizes their calls and sources. The Chat adapter does not support provider tools.

## Provider tools

```ts
type GrokWebSearchOptions = {
  allowedDomains?: string[]
  excludedDomains?: string[]
  enableImageUnderstanding?: boolean
  enableImageSearch?: boolean
}

type GrokXSearchOptions = {
  allowedHandles?: string[]
  excludedHandles?: string[]
  fromDate?: string
  toDate?: string
  enableImageUnderstanding?: boolean
  enableVideoUnderstanding?: boolean
}

type GrokFileSearchOptions = {
  vectorStoreIds: string[]
  maxNumResults?: number
}

type GrokMcpOptions = {
  serverUrl: string
  serverLabel: string
  serverDescription?: string
  allowedTools?: string[]
  authorization?: string
  headers?: Record<string, string>
}

type GrokProviderTool = ProviderTool & {
  provider: 'grok'
}

function webSearch(options?: GrokWebSearchOptions): GrokProviderTool
function xSearch(options?: GrokXSearchOptions): GrokProviderTool
function codeInterpreter(): GrokProviderTool
function fileSearch(options: GrokFileSearchOptions): GrokProviderTool
function mcp(options: GrokMcpOptions): GrokProviderTool

const tools: {
  webSearch: typeof webSearch
  xSearch: typeof xSearch
  codeInterpreter: typeof codeInterpreter
  fileSearch: typeof fileSearch
  mcp: typeof mcp
}
```

`webSearch()` makes allowed and excluded domains mutually exclusive and accepts at most five. `xSearch()` makes allowed and excluded handles mutually exclusive, accepts at most 20, validates `YYYY-MM-DD` dates, and requires `fromDate <= toDate`. `fileSearch()` requires at least one vector-store ID and a positive integer result limit. `mcp()` requires an HTTPS URL and non-empty labels, credentials, and headers.

The individual factories and the `tools` object are equivalent exports.

## Image generation

```ts
class GrokImageGenerationModel
  implements ImageGenerationModel<unknown, GrokImageGenerationModelName> {
  readonly defaultModel: GrokImageGenerationModelName
  readonly provider: 'grok'

  constructor(
    client: OpenAI,
    defaultModel?: GrokImageGenerationModelName,
    fetchFn?: typeof fetch,
  )

  imageGeneration(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResponse<unknown>>
}

function imageResponseFromGrok(
  response: unknown,
  fetchFn?: typeof fetch,
): Promise<ImageGenerationResponse<unknown>>

function aspectRatio(width: number, height: number): string
```

`imageResponseFromGrok()` accepts base64 or URL provider output and returns Anvia image bytes. URL output requires `fetchFn`. `aspectRatio()` reduces dimensions to a ratio string; the model adapter maps unsupported xAI ratios to `auto`.

## Batch audio and transcription

```ts
class GrokAudioGenerationModel implements AudioGenerationModel<unknown> {
  readonly provider: 'grok'

  constructor(http: GrokHttpOptions)

  audioGeneration(
    request: AudioGenerationRequest,
  ): Promise<AudioGenerationResponse<unknown>>
}

class GrokTranscriptionModel implements TranscriptionModel<unknown> {
  readonly provider: 'grok'

  constructor(http: GrokHttpOptions)

  transcription(
    request: TranscriptionRequest,
  ): Promise<TranscriptionResponse<unknown>>
}
```

The emitted supporting type is:

```ts
type GrokHttpOptions = {
  apiKey?: string
  baseUrl: string
  headers?: Record<string, string>
  fetch?: typeof fetch
}
```

`GrokHttpOptions` is not a package export, even though it appears in the two public constructor signatures. Most applications should obtain both models from `GrokClient` so credentials, headers, base URL, and `fetch` stay consistent.

## Model name types

```ts
type KnownGrokCompletionModelName =
  | 'grok-4.5'
  | 'grok-4.20'
  | 'grok-4.20-0309-non-reasoning'
  | 'grok-4.20-0309-reasoning'
  | 'grok-4.20-multi-agent-0309'
  | 'grok-4.20-non-reasoning'
  | 'grok-4.3'
  | 'grok-build-0.1'

type KnownGrokImageGenerationModelName =
  | 'grok-imagine-image'
  | 'grok-imagine-image-quality'

type GrokCompletionModelName = ModelId<KnownGrokCompletionModelName>
type GrokImageGenerationModelName = ModelId<KnownGrokImageGenerationModelName>
```

## Constants

```ts
const XAI_BASE_URL = 'https://api.x.ai/v1'
const GROK_4_5 = 'grok-4.5'
const GROK_4_3 = 'grok-4.3'
const GROK_4_20 = 'grok-4.20'
const GROK_4_20_NON_REASONING = 'grok-4.20-non-reasoning'
const GROK_BUILD_0_1 = 'grok-build-0.1'
const GROK_IMAGINE_IMAGE = 'grok-imagine-image'
const GROK_IMAGINE_IMAGE_QUALITY = 'grok-imagine-image-quality'
```

## `grok` namespace

`grok` contains the same clients, classes, helpers, tool factories, constants, option types, and model-name types exported at the package root:

```ts
import { grok } from '@anvia/grok'

const client = new grok.GrokClient({ apiKey })
const search = grok.tools.webSearch()
```
