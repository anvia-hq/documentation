# `@anvia/grok` API reference

The package exports `GrokClient`, model IDs and handle types, provider-tool factories, model constants, image helpers, and the same surface under the `grok` namespace. It has no public subpath exports.

## Client

```ts
import type OpenAI from 'openai'
import type { ModelContextLimits } from '@anvia/core/completion'

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

  completionModel(options: {
    modelId: GrokCompletionModelId
    api: 'responses' | 'chat'
    contextLimits?: ModelContextLimits
  }): GrokCompletionModelHandle

  imageGenerationModel(options: {
    modelId: GrokImageGenerationModelId
  }): GrokImageGenerationModelHandle

  speechGenerationModel(): GrokSpeechGenerationModelHandle
  transcriptionModel(): GrokTranscriptionModelHandle
  listModels(options?: { abortSignal?: AbortSignal }): Promise<ModelList>
}
```

All model IDs and the completion API are explicit. When injecting an OpenAI SDK client, supply `http` separately because Grok media endpoints also need credentials and transport settings.

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

The package exports known and extensible completion/image model IDs, the corresponding model handle and option types, `XAI_BASE_URL`, Grok model constants, and:

```ts
function imageResponseFromGrok(
  response: unknown,
  fetchFn?: typeof fetch,
  abortSignal?: AbortSignal,
): Promise<ImageGenerationResult<unknown>>

function aspectRatio(width: number, height: number): string
```

Use `imageResponseFromGrok()` only when adapting raw xAI image responses yourself; ordinary applications should call the image-generation model contract.
