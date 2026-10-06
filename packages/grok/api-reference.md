# `@anvia/grok` API reference

The package exports `GrokClient`, model IDs and handle types, provider-tool factories, model constants, typed reasoning controls, image helpers, and the same surface under the `grok` namespace. It has no public subpath exports.

## Client

```ts
import type OpenAI from 'openai'
import type { CompletionModelControls, ModelContextLimits } from '@anvia/core/completion'

type GrokClientOptions =
  | {
      apiKey: string
      baseUrl?: string
      headers?: Record<string, string>
      fetch?: typeof fetch
      client?: never
      http?: never
    }
  | {
      client: OpenAI
      http: {
        apiKey: string
        baseUrl?: string
        headers?: Record<string, string>
        fetch?: typeof fetch
      }
      apiKey?: never
      baseUrl?: never
      headers?: never
      fetch?: never
    }

class GrokClient {
  constructor(options: GrokClientOptions)

  completionModel<
    const ModelId extends GrokCompletionModelId,
    const Controls extends CompletionModelControls = GrokControlsFor<ModelId>,
  >(options: {
    modelId: ModelId
    api: 'responses' | 'chat'
    contextLimits?: ModelContextLimits
    controls?: Controls
  }): GrokCompletionModelHandle<Controls>

  imageGenerationModel(options: {
    modelId: GrokImageGenerationModelId
  }): GrokImageGenerationModelHandle

  speechGenerationModel(): GrokSpeechGenerationModelHandle
  transcriptionModel(): GrokTranscriptionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

All model IDs and the completion API are explicit. Omitting `controls` applies per-model reasoning defaults derived from the model ID (`GrokControlsFor`). When injecting an OpenAI SDK client, supply `http` separately because Grok media endpoints also need credentials and transport settings.

## Provider tools

```ts
function webSearch(options?: GrokWebSearchOptions): GrokProviderTool
function xSearch(options?: GrokXSearchOptions): GrokProviderTool
function codeInterpreter(): GrokProviderTool
function fileSearch(options: GrokFileSearchOptions): GrokProviderTool
function mcp(options: GrokMcpOptions): GrokProviderTool

const tools = { webSearch, xSearch, codeInterpreter, fileSearch, mcp }
```

`webSearch()` validates mutually exclusive allowed/excluded domains. `xSearch()` does the same for handles and validates its date range. `fileSearch()` requires vector-store IDs. `mcp()` requires an HTTPS server URL and validates its labels, credentials, headers, and tool allow-list.

## Other exports

The package exports known and extensible completion/image model IDs, the corresponding model handle and option types, `XAI_BASE_URL`, Grok model constants, typed reasoning controls, and:

```ts
function imageResponseFromGrok(
  response: unknown,
  fetchFn?: typeof fetch,
  abortSignal?: AbortSignal,
): Promise<ImageGenerationResult<unknown>>

function aspectRatio(width: number, height: number): string
```

Use `imageResponseFromGrok()` only when adapting raw xAI image responses yourself; ordinary applications should call the image-generation model contract.

Typed reasoning controls: `GROK_REASONING_EFFORTS` enumerates `none | low | medium | high | xhigh`, and `GrokControlsFor`, `GrokReasoningControls`, and `GrokReasoningEffort` type the per-model surface. The `grok-4.6` family (`grok-4.6`, `grok-4.6-latest`, `grok-4.20-multi-agent-0309`) allows `low` to `xhigh` with `high` as the default; `grok-4.5` allows `low | medium | high`, also defaulting to `high`; `grok-4.3` and `grok-4.3-latest` allow `none` to `high` with no default. Other model IDs expose no reasoning controls.

### Named model constants

| Constant | Model ID string |
| --- | --- |
| `GROK_4_3` | `grok-4.3` |
| `GROK_4_5` | `grok-4.5` |
| `GROK_4_6` | `grok-4.6` |
| `GROK_4_20` | `grok-4.20` |
| `GROK_4_20_NON_REASONING` | `grok-4.20-non-reasoning` |
| `GROK_BUILD_0_1` | `grok-build-0.1` |
| `GROK_IMAGINE_IMAGE` | `grok-imagine-image` |
| `GROK_IMAGINE_IMAGE_QUALITY` | `grok-imagine-image-quality` |

Constants are source identifiers, not a live availability check. Select models explicitly and
check upstream availability for the account and endpoint you use.
