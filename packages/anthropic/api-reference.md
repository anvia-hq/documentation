# `@anvia/anthropic` API reference

Import every public symbol from `@anvia/anthropic`. The package has no public subpath exports.

## Direct Anthropic client

```ts
type AnthropicClientOptions =
  | { apiKey: string; baseUrl?: string; client?: never }
  | { client: Anthropic; apiKey?: never; baseUrl?: never }

type AnthropicCompletionModelOptions = {
  modelId: AnthropicCompletionModelId
  contextLimits?: ModelContextLimits
  controls?: Controls
}

class AnthropicClient implements ModelListingClient {
  constructor(options: AnthropicClientOptions)
  completionModel(options: AnthropicCompletionModelOptions):
    AnthropicCompletionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

All constructors and factories require an options object. Managed credentials and an injected SDK client are mutually exclusive. The completion model ID is explicit; there is no factory default.

`AnthropicCompletionModelHandle` is a `StreamingCompletionModel<unknown, Controls>`. It normalizes Messages API responses, stream events, usage, tool calls, documents, images, and reasoning into Anvia completion contracts.
`completionModel()` accepts an optional `controls` object on both clients. When omitted, controls resolve from the model ID through the exported `AnthropicControlsFor` type, which tiers a typed reasoning-effort control drawn from `ANTHROPIC_REASONING_EFFORTS` (`low`, `medium`, `high`, `xhigh`, `max`): `claude-fable-5`, `claude-mythos-5`, `claude-opus-4-7`, `claude-opus-4-8`, `claude-opus-5`, and `claude-sonnet-5` accept all five efforts; `claude-mythos-preview`, `claude-opus-4-6`, and `claude-sonnet-4-6` accept up to `max`; `claude-opus-4-5` accepts up to `high`; unknown IDs expose no controls. The selected effort is forwarded as `output_config.effort` on the Messages request.

## Vertex AI client

```ts
type AnthropicVertexClientOptions =
  | (Omit<ClientOptions, 'maxRetries'> & { client?: never })
  | { client: AnthropicVertex /* all managed options are excluded */ }

type AnthropicVertexCompletionModelOptions = {
  modelId: AnthropicCompletionModelId
  contextLimits?: ModelContextLimits
  controls?: Controls
}

class AnthropicVertexClient {
  constructor(options: AnthropicVertexClientOptions)
  completionModel(options: AnthropicVertexCompletionModelOptions):
    AnthropicVertexCompletionModelHandle
}
```

`ClientOptions` comes from `@anthropic-ai/vertex-sdk`. Vertex and injected-client construction are mutually exclusive, the model ID is required, and this client intentionally has no `listModels()` method.

## Model IDs and namespace

`AnthropicCompletionModelId` is `ModelId<KnownAnthropicCompletionModelId>`, preserving autocomplete for known Claude IDs while accepting other string IDs. The exact known-ID union is exported and evolves with provider support.

The `anthropic` namespace re-exports the same clients and public option, handle, and model-ID types. It has no state of its own.
