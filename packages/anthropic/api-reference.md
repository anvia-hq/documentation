# `@anvia/anthropic` API reference

Import every public symbol from `@anvia/anthropic`. The package has no public subpath exports.

## `AnthropicClient`

```ts
type AnthropicClientOptions = {
  apiKey?: string
  baseUrl?: string
  client?: Anthropic
}

class AnthropicClient implements ModelListingClient {
  readonly client: Anthropic

  constructor(options?: AnthropicClientOptions)

  completionModel(
    model?: AnthropicCompletionModelName,
  ): AnthropicCompletionModel

  listModels(): Promise<ModelList>
}
```

Construction requires a non-empty API key unless `client` is supplied. `completionModel()` defaults to `claude-sonnet-4-20250514`. `listModels()` normalizes the Anthropic model list and wraps failures in `ModelListingError`.

## `AnthropicVertexClient`

```ts
type AnthropicVertexClientOptions = ClientOptions & {
  client?: AnthropicVertex
}

class AnthropicVertexClient {
  readonly client: AnthropicVertex

  constructor(options?: AnthropicVertexClientOptions)

  completionModel(
    model?: AnthropicCompletionModelName,
  ): AnthropicCompletionModel
}
```

`ClientOptions` comes from `@anthropic-ai/vertex-sdk`. It includes the official SDK’s project, region, Google authentication, access-token, and transport options. The factory defaults to `claude-sonnet-5`. It intentionally has no `listModels()` method.

## `AnthropicCompletionModel`

```ts
class AnthropicCompletionModel
  implements StreamingCompletionModel<unknown, AnthropicCompletionModelName> {
  readonly defaultModel: AnthropicCompletionModelName
  readonly provider: 'anthropic'
  readonly capabilities: CompletionModelCapabilities

  constructor(
    client: Anthropic | AnthropicVertex,
    defaultModel?: AnthropicCompletionModelName,
    metadataOptions?: CompletionModelMetadataOptions,
  )

  getModelInfo(
    model?: AnthropicCompletionModelName,
  ): CompletionModelInfo<AnthropicCompletionModelName> | undefined

  traceRequest(
    request: CompletionRequest<AnthropicCompletionModelName>,
    options?: { stream?: boolean },
  ): JsonObject

  completion(
    request: CompletionRequest<AnthropicCompletionModelName>,
  ): Promise<CompletionResponse>

  streamCompletion(
    request: CompletionRequest<AnthropicCompletionModelName>,
  ): AsyncIterable<CompletionStreamEvent>
}
```

The same adapter accepts either Anthropic client implementation and normalizes Messages API responses, stream events, usage, tool calls, and reasoning into Anvia completion types.

## Model name types

```ts
type KnownAnthropicCompletionModelName =
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3-haiku-20240307'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-fable-5'
  | 'claude-haiku-4-5'
  | 'claude-haiku-4-5-20251001'
  | 'claude-opus-4-0'
  | 'claude-opus-4-1'
  | 'claude-opus-4-1-20250805'
  | 'claude-opus-4-20250514'
  | 'claude-opus-4-5'
  | 'claude-opus-4-5-20251101'
  | 'claude-opus-4-6'
  | 'claude-opus-4-7'
  | 'claude-opus-4-8'
  | 'claude-sonnet-4-0'
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4-5'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-sonnet-4-6'
  | 'claude-sonnet-5'

type AnthropicCompletionModelName = ModelId<KnownAnthropicCompletionModelName>
```

`ModelId<KnownAnthropicCompletionModelName>` retains autocomplete while permitting other string model IDs.

## `anthropic` namespace

```ts
import { anthropic } from '@anvia/anthropic'

const client = new anthropic.AnthropicClient({ apiKey })
```

`anthropic` re-exports the same two clients, completion model, option types, and model-name types as a namespace. It has no state of its own.

